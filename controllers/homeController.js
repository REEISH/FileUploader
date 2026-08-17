const { prisma } = require("../lib/prisma");

exports.getLandingPage = (req, res) => {
  res.render("index");
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.query.folder || null;
    let currentFolder = undefined;
    if (folderId) {
      currentFolder = await prisma.folder.findUnique({
        where: { id: folderId },
      });

      if (!currentFolder || currentFolder.userId !== userId) {
        return res.status(403).send("Unauthorized access to this folder.");
      }
    }

    const folders = await prisma.folder.findMany({
      where: {
        userId: userId,
        parentId: folderId,
      },
    });

    const files = await prisma.file.findMany({
      where: {
        userId: userId,
        folderId: folderId,
      },
    });

    res.render("dashboard", {
      user: req.user,
      folders,
      files,
      currentFolder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading the dashboard.");
  }
};
