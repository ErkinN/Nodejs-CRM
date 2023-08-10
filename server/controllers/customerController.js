const Customer = require("../models/Customer");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const uploadFile = require("../middleware/upload");

/**
 * GET /
 * Homepage
 */
exports.homepage = async (req, res) => {
  const messages = await req.consumeFlash("info");
  const locals = {
    title: "NodeJs",
    description: "NodeJs CRM",
  };

  let perPage = 4;
  let page = req.query.page || 1;

  try {
    const customers = await Customer.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const count = await Customer.count();

    res.render("index", {
      locals,
      customers,
      current: page,
      pages: Math.ceil(count / perPage),
      messages,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * GET /
 * About
 */
exports.about = async (req, res) => {
  const locals = {
    title: "About",
    description: "NodeJs User Management System",
  };

  try {
    res.render("about", locals);
  } catch (error) {
    console.log(error);
  }
};

/**
 * GET /
 * New Customer Form
 */
exports.addCustomer = async (req, res) => {
  const locals = {
    title: "Add New Customer - NodeJs",
    description: "NodeJs User Management System",
  };

  res.render("customer/add", locals);
};

/**
 * POST /
 * Create New Customer
 */
exports.postCustomer = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(401).json({ message: "Please provide  password" });
  }

  // Check for duplicate username
  const duplicate = await Customer.findOne({ password })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate password" });
  }

  const newCustomer = new Customer({
    author: req.body.author,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    details: req.body.details,
    tel: req.body.tel,
    email: req.body.email,
    resume: req.file?.filename,
  });

  try {
    await Customer.create(newCustomer);
    await req.flash("info", "New customer has been added.");

    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

/**
 * GET /
 * Customer Data
 */
exports.view = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id });

    const locals = {
      title: "View Customer Data",
      description: "NodeJs User Management System",
    };

    res.render("customer/view", {
      locals,
      customer,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * GET /
 * Edit Customer Data
 */
exports.edit = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id });

    const locals = {
      title: "Edit Customer Data",
      description: "NodeJs User Management System",
    };

    res.render("customer/edit", {
      locals,
      customer,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * GET /
 * Update Customer Data
 */
exports.editPost = async (req, res) => {
  const { password } = req.body;
  const matchAuthor = await Customer.findOne({ password }).exec();
  if (!matchAuthor) return res.status(401).json({ message: "Unauthorized" });
  if (matchAuthor) {
    try {
      await Customer.findByIdAndUpdate(req.params.id, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        tel: req.body.tel,
        email: req.body.email,
        details: req.body.details,
        updatedAt: Date.now(),
      });
      res.redirect(`/edit/${req.params.id}`);
    } catch (error) {
      console.log(error);
    }
  }
};

/**
 * Delete /
 * Delete Customer Data
 */
exports.deleteCustomer = async (req, res) => {
  const { password } = req.body;
  const matchAuthor = await Customer.findOne({ password }).exec();
  if (!matchAuthor) return res.status(401).json({ message: "Unauthorized" });
  if (matchAuthor) {
    try {
      await Customer.deleteOne({ _id: req.params.id });
      res.redirect("/");
    } catch (error) {
      console.log(error);
    }
  }
};

/**
 * Get /
 * Search Customer Data
 */
exports.searchCustomers = async (req, res) => {
  const locals = {
    title: "Search Customer Data",
    description: "NodeJs User Management System",
  };

  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const customers = await Customer.find({
      $or: [
        { firstName: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { lastName: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });

    res.render("search", {
      customers,
      locals,
    });
  } catch (error) {
    console.log(error);
  }
};

///////////

// exports.download = async (req, res) => {
//   try {
//     const customer = await Customer.findOne({ resume: req.params.fileName });

//     const locals = {
//       title: "Edit Customer Data",
//       description: "NodeJs User Management System",
//     };

//     res.render("customer/resume", {
//       locals,
//       customer,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

//check if the resume is avaiable
// const resumeExists = await Customer.findOne({ fileName });
// console.log(resumeExists);
// if (resumeExists) {
//   const path = __dirname + "public/uploads/";
//   res.download(path + fileName, fileName, (err) => {
//     if (err) {
//       res.status(500).send({
//         message: "Could not download the file" + err,
//       });
//     }
//   });
// } else {
//   res.status(404).render("resume");
// }
