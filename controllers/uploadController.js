const supabase = require("../config/supabase");
const { prisma } = require("../lib/prisma");

const MAX_STORAGE_BYTES = 16 * 1024 * 1024; // 16 MB

exports.uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user.id;
    const folderId = req.body.folderId || null;

    if (!file) {
      return res.status(400).send("No file provided. Please go back.");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.storageUsed + file.size > MAX_STORAGE_BYTES) {
      return res
        .status(403)
        .send("Storage limit exceeded. Maximum 16 MB allowed. Please go back.");
    }
    const safeFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}-${safeFileName}`;
    const filePath = `${userId}/${uniqueFileName}`;
    const { data, error } = await supabase.storage
      .from("user_file")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from("user_file")
      .getPublicUrl(filePath);

    await prisma.$transaction([
      prisma.file.create({
        data: {
          name: file.originalname,
          size: file.size,
          url: publicUrlData.publicUrl,
          userId: userId,
          folderId: folderId,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { storageUsed: { increment: file.size } },
      }),
    ]);
    if (folderId) {
      res.redirect(`/dashboard?folder=${folderId}`);
    } else {
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error("UPLOAD ERROR DETAILS:", err);
    res
      .status(500)
      .send(
        "An error occurred during upload. Please check your terminal and go back.",
      );
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.id;

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.userId !== userId) {
      return res.status(404).send("File not found or unauthorized.");
    }

    const downloadUrl = `${file.url}?download=${encodeURIComponent(file.name)}`;

    res.redirect(downloadUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while downloading the file.");
  }
};
