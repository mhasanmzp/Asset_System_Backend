const express = require("express");
const Sequelize = require("sequelize");
const nodemailer = require("nodemailer");
const { QueryTypes } = require("sequelize");
const { sequelize, Teams } = require("../../config/db.config.js");
const Op = Sequelize.Op;
const smtp = require("../../config/main.js");
const db = require("../../config/db.config.js");
const path = require("path");
var apiRoutes = express.Router();
const fs = require('fs');
const { isNull, concat, entries } = require("lodash");
const { raw } = require("body-parser");
const category = db.AssetCategory
const challan = db.AssetChallan
const engineer = db.AssetEngineer
const inventory = db.AssetInventory
const item = db.AssetItem
const model = db.AssetModel
const movement = db.AssetMovement
const oem = db.AssetOem
const project = db.AssetProject
const purchase = db.AssetPurchase
const site = db.AssetSite
const testing = db.AssetTesting
const warranty = db.AssetWarranty

module.exports = function (app) {
  let smtpAuth = {
    user: smtp.smtpuser,
    pass: smtp.smtppass,
  };
  let smtpConfig = {
    host: smtp.smtphost,
    port: smtp.smtpport,
    secure: false,
    auth: smtpAuth,
    //auth:cram_md5
  }
  let transporter = nodemailer.createTransport(smtpConfig);
  transporter.verify(function (error, success) {
    if (error) {
      //console.log(error);
    } else {
      //console.log("Server is ready to take our messages");
    }
  });


  // Routes for AssetCategory
  app.post('/asset-category', async (req, res) => {
    try {
      const { name, description } = req.body;
      // Function to generate new categoryId
      const getNewCategoryId = async () => {
        const maxCategory = await category.max('categoryId');
        return maxCategory ? maxCategory + 1 : 1000;
      };

      // Check if name already exists
      const existingCategory = await category.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }

      // Get new categoryId
      const newCategoryId = await getNewCategoryId();

      // Create new category
      const newCategory = await category.create({
        categoryId: newCategoryId,
        name,
        description
      });

      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ message: 'Error creating category', error });
    }
  });
  //for multiple entries
  app.post('/asset-category', async (req, res) => {
    try {
      const categories = req.body; // Assume categories is an array of objects [{ name: 'Category1', description: 'Description1' }, ...]
  
      // Function to generate new categoryId
      const getNewCategoryId = async () => {
        const maxCategory = await category.max('categoryId');
        return maxCategory ? maxCategory + 1 : 1000;
      };
  
      const newCategories = [];
  
      for (const cat of categories) {
        const { name, description } = cat;
  
        // Check if name already exists
        const existingCategory = await category.findOne({ where: { name } });
        if (existingCategory) {
          return res.status(400).json({ message: `Category name ${name} already exists` });
        }
  
        // Get new categoryId
        const newCategoryId = await getNewCategoryId();
  
        // Create new category
        const newCategory = await category.create({
          categoryId: newCategoryId,
          name,
          description
        });
  
        newCategories.push(newCategory);
      }
  
      res.status(201).json(newCategories);
    } catch (error) {
      res.status(500).json({ message: 'Error creating categories', error });
    }
  });

  app.post('/asset-categories-dropdown', async (req, res) => {
    try {
      const categories = await category.findAll({
        attributes: ['categoryId', 'name'],
        order: [['name', 'ASC']]
      });

      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories', error });
    }
  });
  app.get('/getCategories', async (req, res) => {
    try {
      const categories = await category.findAll({
        attributes: ['categoryId', 'name'],
        order: [['name', 'ASC']]
      });

      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories', error });
    }
  });

  // Routes for AssetEngineer
  app.post('/asset-engineer', async (req, res) => {
    try {
      const { name, phone, email } = req.body;
      const getNewEngineerId = async () => {
        const maxEngineer = await engineer.max('engineerId');
        return maxEngineer ? maxEngineer + 1 : 1000;
      };

      // Check if email already exists
      const existingEngineer = await engineer.findOne({ where: { email } });
      if (existingEngineer) {
        return res.status(400).json({ message: 'Engineer email already exists' });
      }

      // Get new engineerId
      const newEngineerId = await getNewEngineerId();

      // Create new engineer
      const newEngineer = await engineer.create({
        engineerId: newEngineerId,
        name,
        phone,
        email
      });

      res.status(201).json(newEngineer);
    } catch (error) {
      res.status(500).json({ message: 'Error creating engineer', error });
    }
  });
  //for multiple engineer entry
  app.post('/asset-engineer', async (req, res) => {
    try {
      const engineers = req.body; // Assume engineers is an array of objects [{ name: 'Engineer1', phone: '1234567890', email: 'email1@example.com' }, ...]
  
      // Function to generate new engineerId
      const getNewEngineerId = async () => {
        const maxEngineer = await engineer.max('engineerId');
        return maxEngineer ? maxEngineer + 1 : 1000;
      };
  
      const newEngineers = [];
  
      for (const eng of engineers) {
        const { name, phone, email } = eng;
  
        // Check if email already exists
        const existingEngineer = await engineer.findOne({ where: { email } });
        if (existingEngineer) {
          return res.status(400).json({ message: `Engineer email ${email} already exists` });
        }
  
        // Get new engineerId
        const newEngineerId = await getNewEngineerId();
  
        // Create new engineer
        const newEngineer = await engineer.create({
          engineerId: newEngineerId,
          name,
          phone,
          email
        });
  
        newEngineers.push(newEngineer);
      }
  
      res.status(201).json(newEngineers);
    } catch (error) {
      res.status(500).json({ message: 'Error creating engineers', error });
    }
  });
  

  app.post('/asset-engineers-dropdown', async (req, res) => {
    try {
      const engineers = await engineer.findAll({
        attributes: ['engineerId', 'name'],
        order: [['name', 'ASC']]
      });

      res.status(200).json(engineers);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching engineers', error });
    }
  });
  // Routes for AssetModel
  app.post('/asset-model', async (req, res) => {
    try {
      const { name, description, categoryId } = req.body;
      // Function to generate new modelId
      const getNewModelId = async () => {
        const maxModel = await model.max('modelId');
        return maxModel ? maxModel + 1 : 1000;
      };

      // Check if name already exists
      const existingModel = await model.findOne({ where: { name } });
      if (existingModel) {
        return res.status(400).json({ message: 'Model name already exists' });
      }

      // Get new modelId
      const newModelId = await getNewModelId();

      // Create new model
      const newModel = await model.create({
        modelId: newModelId,
        name,
        description,
        categoryId
      });

      res.status(201).json(newModel);
    } catch (error) {
      res.status(500).json({ message: 'Error creating model', error });
    }
  });
  //for multiple model
  app.post('/asset-model', async (req, res) => {
    try {
      const models = req.body; // Assume models is an array of objects [{ name: 'Model1', description: 'Description1', categoryId: 1 }, ...]
  
      // Function to generate new modelId
      const getNewModelId = async () => {
        const maxModel = await model.max('modelId');
        return maxModel ? maxModel + 1 : 1000;
      };
  
      const newModels = [];
  
      for (const mod of models) {
        const { name, description, categoryId } = mod;
  
        // Check if name already exists
        const existingModel = await model.findOne({ where: { name } });
        if (existingModel) {
          return res.status(400).json({ message: `Model name ${name} already exists` });
        }
  
        // Get new modelId
        const newModelId = await getNewModelId();
  
        // Create new model
        const newModel = await model.create({
          modelId: newModelId,
          name,
          description,
          categoryId
        });
  
        newModels.push(newModel);
      }
  
      res.status(201).json(newModels);
    } catch (error) {
      res.status(500).json({ message: 'Error creating models', error });
    }
  });  

  app.post('/asset-models-dropdown', async (req, res) => {
    try {
      const models = await model.findAll({
        attributes: ['modelId', 'name'],
        order: [['name', 'ASC']]
      });

      res.status(200).json(models);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching models', error });
    }
  });

  // Routes for AssetOem
  app.post('/asset-oem', async (req, res) => {
    try {
      const { oemName, phone, email, address } = req.body;
      // Function to generate new oemId
      const getNewOemId = async () => {
        const maxOem = await oem.max('oemId');
        return maxOem ? maxOem + 1 : 1000;
      };

      // Check if email already exists
      const existingOem = await oem.findOne({ where: { email } });
      if (existingOem) {
        return res.status(400).json({ message: 'OEM email already exists' });
      }

      // Get new oemId
      const newOemId = await getNewOemId();

      // Create new OEM
      const newOem = await oem.create({
        oemId: newOemId,
        oemName,
        phone,
        email,
        address
      });

      res.status(201).json(newOem);
    } catch (error) {
      res.status(500).json({ message: 'Error creating OEM', error });
    }
  });
  //for multiple oems
  app.post('/asset-oem', async (req, res) => {
    try {
      const oems = req.body; // Assume oems is an array of objects [{ oemName: 'OEM1', phone: '1234567890', email: 'email1@example.com', address: 'Address1' }, ...]
  
      // Function to generate new oemId
      const getNewOemId = async () => {
        const maxOem = await oem.max('oemId');
        return maxOem ? maxOem + 1 : 1000;
      };
  
      const newOems = [];
  
      for (const o of oems) {
        const { oemName, phone, email, address } = o;
  
        // Check if email already exists
        const existingOem = await oem.findOne({ where: { email } });
        if (existingOem) {
          return res.status(400).json({ message: `OEM email ${email} already exists` });
        }
  
        // Get new oemId
        const newOemId = await getNewOemId();
  
        // Create new OEM
        const newOem = await oem.create({
          oemId: newOemId,
          oemName,
          phone,
          email,
          address
        });
  
        newOems.push(newOem);
      }
  
      res.status(201).json(newOems);
    } catch (error) {
      res.status(500).json({ message: 'Error creating OEMs', error });
    }
  });
  

  app.put('/asset-oem/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { oemName, phone, email, address } = req.body;

      // Find the OEM by id
      const oem = await oem.findByPk(id);
      if (!oem) {
        return res.status(404).json({ message: 'OEM not found' });
      }

      // Update the OEM
      oem.oemName = oemName || oem.oemName;
      oem.phone = phone || oem.phone;
      oem.email = email || oem.email;
      oem.address = address || oem.address;
      await oem.save();

      res.status(200).json(oem);
    } catch (error) {
      res.status(500).json({ message: 'Error updating OEM', error });
    }
  });

  app.post('/asset-oems-dropdown', async (req, res) => {
    try {
      const oems = await oem.findAll({
        attributes: ['oemId', 'oemName'],
        order: [['oemName', 'ASC']]
      });

      res.status(200).json(oems);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching OEMs', error });
    }
  });

  // Routes for AssetProject
  app.post('/asset-project', async (req, res) => {
    try {
      const { projectName, description, startDate, endDate } = req.body;
      // Function to generate new projectId
      const getNewProjectId = async () => {
        const maxProject = await project.max('projectId');
        return maxProject ? maxProject + 1 : 1000;
      };

      // Check if projectName already exists
      const existingProject = await project.findOne({ where: { projectName } });
      if (existingProject) {
        return res.status(400).json({ message: 'Project name already exists' });
      }

      // Get new projectId
      const newProjectId = await getNewProjectId();

      // Create new project
      const newProject = await project.create({
        projectId: newProjectId,
        projectName,
        description,
        startDate,
        endDate
      });

      res.status(201).json(newProject);
    } catch (error) {
      res.status(500).json({ message: 'Error creating project', error });
    }
  });
  //for multiple project
  app.post('/asset-project', async (req, res) => {
    try {
      const projects = req.body; // Assume projects is an array of objects [{ projectName: 'Project1', description: 'Description1', startDate: '2024-06-01', endDate: '2024-06-30' }, ...]
  
      // Function to generate new projectId
      const getNewProjectId = async () => {
        const maxProject = await project.max('projectId');
        return maxProject ? maxProject + 1 : 1000;
      };
  
      const newProjects = [];
  
      for (const p of projects) {
        const { projectName, description, startDate, endDate } = p;
  
        // Check if projectName already exists
        const existingProject = await project.findOne({ where: { projectName } });
        if (existingProject) {
          return res.status(400).json({ message: `Project name ${projectName} already exists` });
        }
  
        // Get new projectId
        const newProjectId = await getNewProjectId();
  
        // Create new project
        const newProject = await project.create({
          projectId: newProjectId,
          projectName,
          description,
          startDate,
          endDate
        });
  
        newProjects.push(newProject);
      }
  
      res.status(201).json(newProjects);
    } catch (error) {
      res.status(500).json({ message: 'Error creating projects', error });
    }
  });
  

  app.put('/asset-project/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { projectName, description, startDate, endDate } = req.body;

      // Find the project by id
      const project = await AssetProject.findByPk(id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Update the project
      project.projectName = projectName || project.projectName;
      project.description = description || project.description;
      project.startDate = startDate || project.startDate;
      project.endDate = endDate || project.endDate;
      await project.save();

      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error updating project', error });
    }
  });

  app.get('/asset-projects-dropdown', async (req, res) => {
    try {
      const projects = await project.findAll({
        attributes: ['projectId', 'projectName'],
        order: [['projectName', 'ASC']]
      });

      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching projects', error });
    }
  });

// Routes for AssetSite
app.post('/asset-site', async (req, res) => {
  try {
    const { siteName, sitePhone, siteEmail, location } = req.body;
    // Function to generate new siteId
const getNewSiteId = async () => {
  const maxSite = await site.max('siteId');
  return maxSite ? maxSite + 1 : 1000;
};

    // Check if siteName already exists
    const existingSite = await site.findOne({ where: { siteName } });
    if (existingSite) {
      return res.status(400).json({ message: 'Site name already exists' });
    }

    // Get new siteId
    const newSiteId = await getNewSiteId();

    // Create new site
    const newSite = await site.create({
      siteId: newSiteId,
      siteName,
      sitePhone,
      siteEmail,
      location
    });

    res.status(201).json(newSite);
  } catch (error) {
    res.status(500).json({ message: 'Error creating site', error });
  }
});
//for multiple sites
app.post('/asset-site', async (req, res) => {
  try {
    const sites = req.body; // Assume sites is an array of objects [{ siteName: 'Site1', sitePhone: '1234567890', siteEmail: 'email1@example.com', location: 'Location1' }, ...]

    // Function to generate new siteId
    const getNewSiteId = async () => {
      const maxSite = await site.max('siteId');
      return maxSite ? maxSite + 1 : 1000;
    };

    const newSites = [];

    for (const s of sites) {
      const { siteName, sitePhone, siteEmail, location } = s;

      // Check if siteName already exists
      const existingSite = await site.findOne({ where: { siteName } });
      if (existingSite) {
        return res.status(400).json({ message: `Site name ${siteName} already exists` });
      }

      // Get new siteId
      const newSiteId = await getNewSiteId();

      // Create new site
      const newSite = await site.create({
        siteId: newSiteId,
        siteName,
        sitePhone,
        siteEmail,
        location
      });

      newSites.push(newSite);
    }

    res.status(201).json(newSites);
  } catch (error) {
    res.status(500).json({ message: 'Error creating sites', error });
  }
});

app.put('/asset-site/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { siteName, sitePhone, siteEmail, location } = req.body;

    // Find the site by id
    const site = await AssetSite.findByPk(id);
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    // Update the site
    site.siteName = siteName || site.siteName;
    site.sitePhone = sitePhone || site.sitePhone;
    site.siteEmail = siteEmail || site.siteEmail;
    site.location = location || site.location;
    await site.save();

    res.status(200).json(site);
  } catch (error) {
    res.status(500).json({ message: 'Error updating site', error });
  }
});

app.post('/asset-sites-dropdown', async (req, res) => {
  try {
    const sites = await site.findAll({
      attributes: ['siteId', 'siteName'],
      order: [['siteName', 'ASC']]
    });

    res.status(200).json(sites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sites', error });
  }
});
app.get('/getSubstations', async (req, res) => {
  try {
    const sites = await site.findAll({
      attributes: ['siteId', 'siteName'],
      order: [['siteName', 'ASC']]
    });

    res.status(200).json(sites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sites', error });
  }
});

app.post('/asset-inventory-grn', async (req, res) => {
  try {
    const {
      categoryName,
      productName,
      inventoryStoreName,
      quantityUnit,
      quantity,
      storeLocation,
      purchaseDate,
      serialNumbers,
      warrantyPeriodMonths,
      oemName,
    } = req.body;

    // Generate a unique 6-digit purchaseId
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const purchaseId = `${oemName}-${randomNumber}`

    const warrantyStartDate = purchaseDate;
    const warrantyEndDate = new Date(purchaseDate);
    warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyPeriodMonths);

    const newEntries = [];

    // Create an entry in AssetPurchase
    const newPurchase = await purchase.create({
      purchaseId,
      oemName,
      categoryName,
      purchaseDate,
      quantity,
      quantityUnit
    });

    if (quantityUnit === "Units") {
      // Create multiple entries with serialNumbers
      for (const serialNumber of serialNumbers) {
        const newEntry = await inventory.create({
          categoryName,
          productName,
          inventoryStoreName,
          quantityUnit,
          storeLocation,
          purchaseDate,
          serialNumber,
          warrantyPeriodMonths,
          warrantyStartDate,
          warrantyEndDate,
          purchaseId // Update purchaseId in AssetInventory
        });
        newEntries.push(newEntry);
      }
    } else {
      // Create a single entry without serialNumbers
      const newEntry = await inventory.create({
        categoryName,
        productName,
        inventoryStoreName,
        quantity,
        quantityUnit,
        storeLocation,
        purchaseDate,
        serialNumber: null, // Assuming serialNumber is not nullable
        warrantyPeriodMonths,
        warrantyStartDate,
        warrantyEndDate,
        purchaseId // Update purchaseId in AssetInventory
      });
      newEntries.push(newEntry);
    }

    res.status(201).json({"message":"Entries Created Successfully"});
  } catch (error) {
    res.status(500).json({ message: 'Error creating entries', error });
  }
});

app.post('/asset-inventory-dashboard', async (req, res) => {
  try {
    // Fetch purchase data
    const purchaseData = await purchase.findAll({
      attributes: ['purchaseId', 'oemName', 'purchaseDate'],
      raw: true
    });

    // Fetch inventory data
    const inventoryData = await inventory.findAll({
      attributes: ['purchaseId', 'categoryName', 'productName', 'status'],
      raw: true
    });

    console.log(purchaseData);
    console.log(inventoryData);

    // Create a lookup table for purchase data
    const purchaseLookup = {};
    purchaseData.forEach(purchase => {
      purchaseLookup[purchase.purchaseId] = {
        purchaseId: purchase.purchaseId,
        oemName: purchase.oemName,
        purchaseDate: purchase.purchaseDate,
        categoryName: '', // Initialize to store later
        productName: '', // Initialize to store later
        totalItems: 0,
        usableItems: 0,
        nonUsableItems: 0
      };
    });

    // Group inventory data by purchaseId
    inventoryData.forEach(item => {
      const purchaseId = item.purchaseId;
      if (purchaseLookup[purchaseId]) {
        purchaseLookup[purchaseId].totalItems++;
        if (item.status === "IN_INVENTORY") {
          purchaseLookup[purchaseId].usableItems++;
        }
        if(item.status === "FAILED"||item.status === "RECEIVED"||item.status === "IN_QUALITY_CHECK"||item.status === "REJECTED"||item.status === "FAULTY"){
          purchaseLookup[purchaseId].nonUsableItems++;

        }
        // Assign productName and categoryName
        purchaseLookup[purchaseId].productName = item.productName;
        purchaseLookup[purchaseId].categoryName = item.categoryName;
      }
    });

    // Calculate non-usable items
    // Object.values(purchaseLookup).forEach(group => {
    //   // group.nonUsableItems = group.totalItems - group.usableItems;
    // });
    const array = Object.values(purchaseLookup)

    res.status(200).json({"purchaseData":Object.values(purchaseLookup)});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching asset inventory summary', error });
  }
});

app.post('/assign-testing-manager', async (req, res) => {
  const { purchaseId, categoryName, oemName, productName, purchaseDate, engineerName } = req.body;

  try {
      // Find the asset with status 'RECEIVED'
      const asset = await inventory.findOne({
          where: {
              purchaseId,
              categoryName,
              oemName,
              productName,
              purchaseDate,
              status: 'RECEIVED'
          }
      });

      if (!asset) {
          return res.status(404).json({ message: 'Asset not found or not in RECEIVED status' });
      }

      // Update the asset
      asset.engineerName = engineerName;
      asset.status = 'IN_QUALITY_CHECK'; // There is a typo here, correct it to 'IN_QUALITY_CHECK' if needed

      await asset.save();

      res.json({ message: 'Testing manager assigned and status updated', asset });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred', error });
  }
});

// API route to assign a testing manager for multiple entries
app.post('/assign-testing-manager', async (req, res) => {
  const { items, engineerName ,status } = req.body;

  try {
      // Loop through each item and update the asset
      const updatePromises = items.map(async (item) => {
          const { purchaseId, categoryName, oemName, productName, purchaseDate, serialNumber } = item;

          // Find the asset with status 'RECEIVED'
          const asset = await AssetInventory.findOne({
              where: {
                  purchaseId,
                  categoryName,
                  oemName,
                  productName,
                  purchaseDate,
                  serialNumber,
                  status: 'RECEIVED'
              }
          });

          if (asset) {
              // Update the asset
              asset.engineerName = engineerName;
              asset.status = status; // Correct the typo if needed

              await asset.save();
          }
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      res.json({ message: 'Testing manager assigned and status updated for all items' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred', error });
  }
});














  app.use("/", apiRoutes);
}