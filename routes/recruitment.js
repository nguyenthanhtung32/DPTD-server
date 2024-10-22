const express = require("express");
const yup = require("yup");
const ObjectId = require("mongodb").ObjectId;
const { CONNECTION_STRING } = require("../constants/dbSettings");
const { default: mongoose } = require("mongoose");
const Recruitment = require("../models/Recruitment");
const nodemailer = require("nodemailer");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// MONGOOSE
mongoose.set("strictQuery", false);
mongoose.connect(CONNECTION_STRING);

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nguyenthanhtung03082001@gmail.com",
    pass: "jyvc smkj xran pmlj",
  },
});

router.post("/send-email", upload.single("cv"), (req, res) => {
  const { name, birthdate, phone, email, position } = req.body;
  const cvFile = req.file;

  const mailOptions = {
    from: `${name}<nguyenthanhtung03082001@gmail.com> `,
    to: "hrbp.dreampokerdanang@gmail.com",
    subject: "Ứng tuyển online",
    text: `
      Họ và Tên: ${name}
      Ngày tháng năm sinh: ${birthdate}
      Số điện thoại: ${phone}
      Email: ${email}
      Vị trí ứng tuyển: ${position}
    `,
    attachments: [
      {
        filename: cvFile.originalname,
        content: cvFile.buffer,
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error); // Log lỗi ra console
      return res.status(500).send(error.toString());
    }
    res.status(200).send("Email sent: " + info.response);
  });
});

// GET ALL
router.get("/", function (req, res, next) {
  try {
    Recruitment.find()
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// GET by ID
router.get("/:id", async function (req, res, next) {
  // Validate
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup
        .string()
        .test("Validate ObjectID", "${path} is not valid ObjectID", (value) => {
          return ObjectId.isValid(value);
        }),
    }),
  });

  validationSchema
    .validate({ params: req.params }, { abortEarly: false })
    .then(async () => {
      const id = req.params.id;

      let found = await Recruitment.findById(id);

      if (found) {
        return res.send({ ok: true, result: found });
      }

      return res.send({ ok: false, message: "Object not found" });
    })
    .catch((err) => {
      return res.status(400).json({
        type: err.name,
        errors: err.errors,
        message: err.message,
        provider: "yup",
      });
    });
});

// POST
router.post("/", async function (req, res, next) {
  // Validate
  const validationSchema = yup.object({
    body: yup.object({
      title: yup.string().required(),
      titleVietnamese: yup.string(),
      quantity: yup.number().required(),
      location: yup.string().required(),
      deadline: yup.date().required(),
      summary: yup.array().of(yup.string()),
      responsibilities: yup.array().of(yup.string()),
    }),
  });

  validationSchema
    .validate({ body: req.body }, { abortEarly: false })
    .then(async () => {
      try {
        const data = req.body;
        const newItem = new Recruitment(data);
        let result = await newItem.save();

        return res.send({ ok: true, message: "Created", result });
      } catch (err) {
        return res.status(500).json({ error: err });
      }
    })
    .catch((err) => {
      return res
        .status(400)
        .json({ type: err.name, errors: err.errors, provider: "yup" });
    });
});

// DELETE
router.delete("/:id", function (req, res, next) {
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup
        .string()
        .test("Validate ObjectID", "${path} is not valid ObjectID", (value) => {
          return ObjectId.isValid(value);
        }),
    }),
  });

  validationSchema
    .validate({ params: req.params }, { abortEarly: false })
    .then(async () => {
      try {
        const id = req.params.id;

        let found = await Recruitment.findByIdAndDelete(id);

        if (found) {
          return res.send({ ok: true, result: found });
        }

        return res.status(410).send({ ok: false, message: "Object not found" });
      } catch (err) {
        return res.status(500).json({ error: err });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        type: err.name,
        errors: err.errors,
        message: err.message,
        provider: "yup",
      });
    });
});

// PATCH (Update)
router.patch("/:id", async function (req, res) {
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup
        .string()
        .test("Validate ObjectID", "${path} is not valid ObjectID", (value) => {
          return ObjectId.isValid(value);
        }),
    }),
    body: yup.object({
      title: yup.string(),
      titleVietnamese: yup.string(),
      quantity: yup.number(),
      location: yup.string(),
      deadline: yup.date(),
      summary: yup.array().of(yup.string()),
      responsibilities: yup.array().of(yup.string()),
    }),
  });

  validationSchema
    .validate({ params: req.params, body: req.body }, { abortEarly: false })
    .then(async () => {
      try {
        const id = req.params.id;
        const data = req.body;
        let updatedItem = await Recruitment.findByIdAndUpdate(id, data, {
          new: true,
        });
        if (updatedItem) {
          return res.send({
            ok: true,
            message: "Updated",
            result: updatedItem,
          });
        }
        return res.status(404).send({ ok: false, message: "Object not found" });
      } catch (err) {
        return res.status(500).json({ error: err });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        type: err.name,
        errors: err.errors,
        message: err.message,
        provider: "yup",
      });
    });
});

module.exports = router;
