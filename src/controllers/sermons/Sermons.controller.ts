import { db } from "@/database";
import { errorCreate } from "@/middleware/errorHandler";
import { existsSync, unlinkSync } from "fs";
import path from "path";

export const SermonsController = {
  async CreateSermons(req, res, next) {
    try {
      const { file } = req;
      const opt = file ? file.opt : null;

      const NewSermons = await db.Sermons.create({
        ...JSON.parse(req.body.data),
        thumbnail: opt || null,
      });
      res.send(NewSermons);
    } catch (error) {
      const { file } = req;
      const path = file ? file.path : null;
      if (path) {
        await unlinkSync(path + ".webp");
      }
      next(error);
    }
  },
  async GetSermonsDataAdmin(req, res, next) {
    try {
      const Sermons = await db.Sermons.findAll({
        order: [["createdAt", "DESC"]],
      });
      res.send(Sermons);
    } catch (error) {
      next(error);
    }
  },
  async GetSermonsData(req, res, next) {
    try {
      const Sermons = await db.Sermons.findAll({
        order: [["createdAt", "DESC"]],
        where: {
          status: "active",
        },
      });
      res.send(Sermons);
    } catch (error) {
      next(error);
    }
  },
  async UpdateSermonsData(req, res, next) {
    try {
      const { file } = req;
      const opt = file ? file.opt : null;
      const sermonsData = await db.Sermons.findOne({
        where: {
          id: req.body.id,
        },
      });

      if (!sermonsData) {
        const path_file = file ? file.path : null;
        if (path_file) {
          await unlinkSync(path_file + ".webp");
        }
        return errorCreate(404, "Video not found !");
      }

      if (opt) {
        const destination = file ? file.destination : null;
        const thumbnailPath = destination
          ? path.join(destination, sermonsData.toJSON().thumbnail)
          : null;

        if (thumbnailPath && existsSync(thumbnailPath)) {
          try {
            await unlinkSync(thumbnailPath);
          } catch (err) {
            console.error("Error deleting the file:", err);
          }
        }
      }

      const update = await sermonsData.update({
        ...JSON.parse(req.body.data),
        thumbnail: opt,
      });
      res.send({
        update: update,
      });
    } catch (error) {
      next(error);
    }
  },
  async DeleteSermonsData(req, res, next) {
    try {
      const deleteSermons = await db.Sermons.destroy({
        where: {
          id: req.body.id,
        },
      });

      res.send({
        success: true,
        data: deleteSermons,
      });
    } catch (error) {
      next(error);
    }
  },
};
