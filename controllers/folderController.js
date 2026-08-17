const { prisma } = require("../lib/prisma");

exports.createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const userId = req.user.id;
    let depth = 1;
    if (parentId) {
      let currentParentId = parentId;
      while (currentParentId) {
        if (depth >= 5) {
          return res
            .status(400)
            .json({ error: "Maximum folder nesting depth of 5 reached." });
        }

        const parentFolder = await prisma.folder.findUnique({
          where: { id: currentParentId },
          select: { parentId: true },
        });

        if (!parentFolder) {
          return res.status(404).json({ error: "Parent folder not found." });
        }

        currentParentId = parentFolder.parentId;
        depth++;
      }
    }
    const folder = await prisma.folder.create({
      data: {
        name,
        userId,
        parentId: parentId || null,
      },
    });
    if (parentId) {
      res.redirect(`/dashboard?folder=${parentId}`);
    } else {
      res.redirect("/dashboard");
    }
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({
        error: "A folder with this name already exists in this directory.",
      });
    }
    console.error(err);
    res.status(500).json({ error: "An error occurred creating the folder." });
  }
};
