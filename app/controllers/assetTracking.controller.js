const express = require("express");
const _ = require('underscore');
const Sequelize = require("sequelize");
const nodemailer = require("nodemailer");
const smtp = require("../../config/main.js");
const db = require("../../config/db.config.js");
var apiRoutes = express.Router();
const fs = require('fs');
const { isNull, concat, entries, attempt } = require("lodash");
const { raw } = require("body-parser");
const { log } = require("console");
const category = db.AssetCategory
const challan = db.AssetChallan
const engineer = db.AssetEngineer
const inventory = db.AssetInventory
const client = db.AssetClient
const model = db.AssetModel
const stores = db.AssetStore
const warehouse = db.AssetWarehouse
const oem = db.AssetOem
const project = db.AssetProject
const purchase = db.AssetPurchase
const site = db.AssetSite
const Employees = db.Employees;

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
  // app.post('/asset-category', async (req, res) => {
  //   try {
  //     const { name, description } = req.body;
  //     // Function to generate new categoryId
  //     const getNewCategoryId = async () => {
  //       const maxCategory = await category.max('categoryId');
  //       return maxCategory ? maxCategory + 1 : 1000;
  //     };

  //     // Check if name already exists
  //     const existingCategory = await category.findOne({ where: { name } });
  //     if (existingCategory) {
  //       return res.status(400).json({ message: 'Category name already exists' });
  //     }

  //     // Get new categoryId
  //     const newCategoryId = await getNewCategoryId();

  //     // Create new category
  //     const newCategory = await category.create({
  //       categoryId: newCategoryId,
  //       name,
  //       description
  //     });

  //     res.status(201).json(newCategory);
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error creating category', error });
  //   }
  // });

  //for multiple entries
  app.post('/asset-category', async (req, res) => {
    try {
      // Extract and validate the data array from the request body
      const { data } = req.body;
      if (!Array.isArray(data)) {
        return res.status(400).json({ message: 'Invalid data format. Expected an array of objects.' });
      }

      // Function to generate new categoryId
      const getNewCategoryId = async () => {
        const maxCategory = await category.max('categoryId');
        return maxCategory ? maxCategory + 1 : 1000;
      };

      const newCategories = [];

      for (const cat of data) {
        const name = cat.category;
        const hsnNumber = cat.hsn;
        if (!name) {
          return res.status(400).json({ message: 'Category name is required.' });
        }

        // Check if name already exists
        const existingCategory = await category.findOne({ where: { name } });
        if (existingCategory) {
          return res.status(400).json({ message: `Category name ${name} already exists.` });
        }

        // Get new categoryId
        const newCategoryId = await getNewCategoryId();

        // Create new category
        const newCategory = await category.create({
          categoryId: newCategoryId,
          name,
          hsnNumber

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
        attributes: ['categoryId', 'name', 'hsnNumber'],
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

  // API to create new stores
  app.post('/asset-stores', async (req, res) => {
    try {
      console.log('Request body:', req.body);
      const getNewStoreId = async () => {
        const maxStoreId = await stores.max('storeId');
        return maxStoreId ? maxStoreId + 1 : 1000;
      };

      const { permissionName, employeeIdMiddleware, employeeId, data } = req.body;

      if (!permissionName || !employeeIdMiddleware || !employeeId) {
        console.log('Missing required fields:', { permissionName, employeeIdMiddleware, employeeId });
        return res.status(400).json({ message: 'Permission name, employeeIdMiddleware, and employeeId must not be empty' });
      }

      const newStores = [];

      for (const item of data) {
        const { store } = item;
        console.log(store);
        const { name: storeName, address } = store;

        console.log('Processing store:', { storeName, address });

        if (!storeName) {
          console.log('Store name is empty:', store);
          return res.status(400).json({ message: 'Store name must not be empty' });
        }

        // Check if storeName already exists
        const existingStore = await stores.findOne({ where: { storeName } });
        if (existingStore) {
          console.log('Warehouse name already exists:', storeName);
          return res.status(400).json({ message: `Warehouse name '${storeName}' already exists` });
        }

        // Get new storeId
        const newStoreId = await getNewStoreId();
        console.log('Generated new storeId:', newStoreId);

        // Create new store object
        newStores.push({
          storeId: newStoreId,
          storeName,
          address,
        });
      }

      console.log('New stores to be created:', newStores);

      // Bulk create new stores
      await stores.bulkCreate(newStores);

      res.status(201).json({ message: 'Stores created successfully', stores: newStores });
    } catch (error) {
      console.error('Error creating stores:', error);
      res.status(500).json({ message: 'Error creating stores', error });
    }
  });

  // API to get store IDs and names
  app.post('/stores-dropdown', async (req, res) => {
    try {
      const storess = await stores.findAll({
        attributes: ['storeId', 'storeName','address']
      });
      res.status(200).send(storess);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  // Routes for AssetEngineer
  // app.post('/asset-engineer', async (req, res) => {
  //   try {
  //     const { name, phone, email } = req.body;
  //     const getNewEngineerId = async () => {
  //       const maxEngineer = await engineer.max('engineerId');
  //       return maxEngineer ? maxEngineer + 1 : 1000;
  //     };

  //     // Check if email already exists
  //     const existingEngineer = await engineer.findOne({ where: { email } });
  //     if (existingEngineer) {
  //       return res.status(400).json({ message: 'Engineer email already exists' });
  //     }

  //     // Get new engineerId
  //     const newEngineerId = await getNewEngineerId();

  //     // Create new engineer
  //     const newEngineer = await engineer.create({
  //       engineerId: newEngineerId,
  //       name,
  //       phone,
  //       email
  //     });

  //     res.status(201).json(newEngineer);
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error creating engineer', error });
  //   }
  // });
  //for multiple engineer entry
  app.post('/asset-engineer', async (req, res) => {
    try {
      console.log("req.body", req.body);
      const { data } = req.body;
      console.log(data);
      // Function to generate new engineerId
      const getNewEngineerId = async () => {
        const maxEngineer = await engineer.max('engineerId');
        return maxEngineer ? maxEngineer + 1 : 1000;
      };

      const newEngineers = [];

      for (const engData of data) {
        console.log("engData", engData);
        const name = engData.name; // Extract the name value

        // Get new engineerId
        const newEngineerId = await getNewEngineerId();

        // Create new engineer
        const newEngineer = await engineer.create({
          engineerId: newEngineerId,
          name
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
  // app.post('/asset-model', async (req, res) => {
  //   try {
  //     const { name, description, categoryId } = req.body;
  //     // Function to generate new modelId
  //     const getNewModelId = async () => {
  //       const maxModel = await model.max('modelId');
  //       return maxModel ? maxModel + 1 : 1000;
  //     };

  //     // Check if name already exists
  //     const existingModel = await model.findOne({ where: { name } });
  //     if (existingModel) {
  //       return res.status(400).json({ message: 'Model name already exists' });
  //     }

  //     // Get new modelId
  //     const newModelId = await getNewModelId();

  //     // Create new model
  //     const newModel = await model.create({
  //       modelId: newModelId,
  //       name,
  //       description,
  //       categoryId
  //     });

  //     res.status(201).json(newModel);
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error creating model', error });
  //   }
  // });
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

  //for multiple oems
  app.post('/asset-oem', async (req, res) => {
    try {
      const { data } = req.body;
      console.log("data", data);
      const getNewOemId = async () => {
        const maxOem = await oem.max('oemId');
        return maxOem ? maxOem + 1 : 1000;
      };
      for (const o of data) {
        const { name: oemName, address, gstNo, panNo } = o;
        if (!oemName) {
          return res.status(400).json({ "message": "Oem name must not be empty" })
        }
        // Check if oem already exists
        const existingOem = await oem.findOne({ where: { oemName } });
        if (existingOem) {
          return res.status(400).json({ message: `OEM Name ${oemName} already exists` });
        }
        // Get new oemId
        const newOemId = await getNewOemId();
        // Create new OEM
        const newOem = await oem.create({
          oemId: newOemId,
          oemName,
          address,
          gstNo,
          panNo
        });
      }
      res.status(201).json({ "message": "Successfully Created" });
    } catch (error) {
      res.status(500).json({ message: 'Error creating OEMs', error });
    }
  });


  app.post('/asset-oems-dropdown', async (req, res) => {
    try {
      const oems = await oem.findAll({
        attributes: ['oemId', 'oemName','address', 'panNo', 'gstNo'],
        order: [['oemName', 'ASC']]
      });
      res.status(200).json(oems);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching OEMs', error });
    }
  });

  // Routes for AssetProject
  // app.post('/asset-project', async (req, res) => {
  //   try {
  //     const { projectName, description, startDate, endDate } = req.body;
  //     // Function to generate new projectId
  //     const getNewProjectId = async () => {
  //       const maxProject = await project.max('projectId');
  //       return maxProject ? maxProject + 1 : 1000;
  //     };

  //     // Check if projectName already exists
  //     const existingProject = await project.findOne({ where: { projectName } });
  //     if (existingProject) {
  //       return res.status(400).json({ message: 'Project name already exists' });
  //     }

  //     // Get new projectId
  //     const newProjectId = await getNewProjectId();

  //     // Create new project
  //     const newProject = await project.create({
  //       projectId: newProjectId,
  //       projectName,
  //       description,
  //       startDate,
  //       endDate
  //     });

  //     res.status(201).json(newProject);
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error creating project', error });
  //   }
  // });
  //for multiple project
  app.post('/asset-project', async (req, res) => {
    try {
      console.log(req.body);
      const { data } = req.body;

      // Function to generate new projectId
      const getNewProjectId = async () => {
        const maxProject = await project.max('projectId');
        return maxProject ? maxProject + 1 : 1000;
      };

      const newProjects = [];

      for (const p of data) {
        const { project: projectName } = p;
        console.log(projectName);

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
          projectName
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
  // app.post('/asset-site', async (req, res) => {
  //   try {
  //     const { siteName, sitePhone, siteEmail, location } = req.body;
  //     // Function to generate new siteId
  //     const getNewSiteId = async () => {
  //       const maxSite = await site.max('siteId');
  //       return maxSite ? maxSite + 1 : 1000;
  //     };

  //     // Check if siteName already exists
  //     const existingSite = await site.findOne({ where: { siteName } });
  //     if (existingSite) {
  //       return res.status(400).json({ message: 'Site name already exists' });
  //     }

  //     // Get new siteId
  //     const newSiteId = await getNewSiteId();

  //     // Create new site
  //     const newSite = await site.create({
  //       siteId: newSiteId,
  //       siteName,
  //       sitePhone,
  //       siteEmail,
  //       location
  //     });

  //     res.status(201).json(newSite);
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error creating site', error });
  //   }
  // });
  //for multiple sites
  app.post('/asset-site', async (req, res) => {
    try {
      const { data } = req.body;
      console.log(req.body);
      // Function to generate new siteId
      const getNewSiteId = async () => {
        const maxSite = await site.max('siteId');
        return maxSite ? maxSite + 1 : 1000;
      };
      const newSites = [];
      for (const s of data) {
        const { name: siteName,address, gstNo, panNo } = s;
        if (!siteName) {
          return res.status(400).json({ "message": "Site name must not be empty" })
        }
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
          address,
          gstNo,
          panNo
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
        attributes: ['siteId', 'siteName','address', 'panNo', 'gstNo'],
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

  app.post('/old-asset-inventory-grn', async (req, res) => {
    try {
      console.log("req.body:::::", req.body);
      // Function to generate a unique 6-digit purchaseId
      const generatePurchaseId = async (oemName) => {
        const randomNumber = Math.floor(100000 + Math.random() * 900000);
        return randomNumber;
      };

      // Function to generate a unique challanId
      const generateChallanId = async () => {
        const maxChallanId = await challan.max('challanId');
        return maxChallanId ? parseInt(maxChallanId) + 1 : 1000;
      };

      const {
        grnDate,
        storeName,
        oemName,
        challanNo,
        challanDate,
        materialRows
      } = req.body;

      // Generate challanId
      const challanId = await generateChallanId();

      const categoriesName = {};
      const productsName = {};
      const quantityUnits = {};
      const newEntries = [];

      let categoryCount = 1;
      let productCount = 1;

      for (const material of materialRows) {
        const {
          categoryName,
          productName,
          quantity,
          quantityUnit,
          warrantyPeriodMonths,
          storeLocation,
          serialNumbers
        } = material;

        // Generate a unique purchaseId
        const purchaseId = await generatePurchaseId();

        const warrantyStartDate = challanDate;
        const warrantyEndDate = new Date(challanDate);
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyPeriodMonths);

        categoriesName[`Category${categoryCount}`] = categoryName;
        productsName[`Product${productCount}`] = productName;
        quantityUnits[`QuantityUnit${productCount}`] = quantityUnit;
        categoryCount++;
        productCount++;

        if (["Units", "KG", "Metre", "Grams", "Pieces", "Dozen", "Box", "Bag"].includes(quantityUnit)) {
          // Create multiple entries with serialNumbers
          for (const serialNumber of serialNumbers) {
            const newEntry = await inventory.create({
              oemName,
              categoryName,
              productName,
              inventoryStoreName: storeName,
              quantityUnit,
              storeLocation,
              purchaseDate: grnDate,
              serialNumber,
              warrantyPeriodMonths,
              warrantyStartDate,
              warrantyEndDate,
              purchaseId,
              status: "RECEIVED",
              challanNumber: challanNo
            });
            newEntries.push(newEntry);
          }
        } else {
          // Create a single entry without serialNumbers
          const newEntry = await inventory.create({
            categoryName,
            productName,
            inventoryStoreName: storeName,
            quantity,
            quantityUnit,
            storeLocation,
            purchaseDate: grnDate,
            serialNumber: null, // Assuming serialNumber is not nullable
            warrantyPeriodMonths,
            warrantyStartDate,
            warrantyEndDate,
            purchaseId,
            status: "RECEIVED",
            challanId: challanNo
          });
          newEntries.push(newEntry);
        }
      }

      // Create an entry in AssetChallan
      const newChallan = await challan.create({
        challanId: challanId.toString(),
        challanNumber: challanNo,
        challanType: 'INWARD',
        categoriesName,
        productsName,
        date: challanDate,
        details: JSON.stringify(req.body)
      });

      // Create an entry in AssetPurchase
      const newPurchase = await purchase.create({
        purchaseId: newEntries[0].purchaseId, // Assuming all entries have the same purchaseId
        oemName,
        categoriesName,
        productsName,
        purchaseDate: grnDate,
        quantity: materialRows.reduce((acc, material) => acc + material.quantity, 0),
        quantityUnits
      });

      res.status(201).json({ message: "Entries Created Successfully" });
    } catch (error) {
      res.status(500).json({ message: 'Error creating entries', error });
    }
  });//important 

  app.post('/old-asset-inventory-grn', async (req, res) => {
    try {
      console.log("req.body:::::", req.body);

      // Function to generate a unique 6-digit purchaseId
      const generatePurchaseId = async (oemName) => {
        const randomNumber = Math.floor(100000 + Math.random() * 900000);
        return randomNumber;
      };

      // const purchaseId = await generatePurchaseId();
      // Function to generate a unique challanId
      const generateChallanId = async () => {
        const maxChallanId = await challan.max('challanId');
        return maxChallanId ? parseInt(maxChallanId) + 1 : 1000;
      };

      const {
        grnDate,
        purchaseOrderNo: purchaseId,
        storeName,
        oemName,
        challanNo,
        challanDate,
        materialRows,
        storeAddress: storeLocation
      } = req.body;

      // Generate challanId
      const challanId = await generateChallanId();

      const categoriesName = {};
      const productsName = {};
      const quantityUnits = {};
      const newEntries = [];

      let categoryCount = 1;
      let productCount = 1;

      for (const material of materialRows) {
        const {
          categoryName,
          productName,
          quantity,
          quantityUnit,
          warrantyPeriodMonths,
          serialNumber
        } = material;
        const catInfo = await category.findOne({ where: { name: categoryName } })
        let hsnNumber = catInfo.hsnNumber
        // Generate a unique purchaseId

        const warrantyStartDate = challanDate;
        const warrantyEndDate = new Date(challanDate);
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyPeriodMonths);

        categoriesName[`Category${categoryCount}`] = categoryName;
        productsName[`Product${productCount}`] = productName;
        quantityUnits[`QuantityUnit${productCount}`] = quantityUnit;
        categoryCount++;
        productCount++;

        if (["Units", "KG", "Metre", "Grams", "Pieces", "Dozen", "Box", "Bag"].includes(quantityUnit)) {
          // Create multiple entries with serialNumbers
          // for (const serialNumber of serialNumbers) {
          const newEntry = await inventory.create({
            oemName,
            categoryName,
            productName,
            inventoryStoreName: storeName,
            quantityUnit,
            storeLocation,
            purchaseDate: grnDate,
            serialNumber,
            warrantyPeriodMonths,
            warrantyStartDate,
            warrantyEndDate,
            purchaseId,
            status: "RECEIVED",
            challanNumber: challanNo,
            hsnNumber
          });
          newEntries.push(newEntry);
          // }
        } else {
          // Create a single entry without serialNumbers
          const newEntry = await inventory.create({
            categoryName,
            productName,
            inventoryStoreName: storeName,
            quantity,
            quantityUnit,
            storeLocation,
            purchaseDate: grnDate,
            serialNumber: null, // Assuming serialNumber is not nullable
            warrantyPeriodMonths,
            warrantyStartDate,
            warrantyEndDate,
            purchaseId,
            status: "RECEIVED",
            challanId: challanNo
          });
          newEntries.push(newEntry);
        }
      }

      // Create an entry in AssetChallan
      const newChallan = await challan.create({
        challanId: challanId.toString(),
        challanNumber: challanNo,
        challanType: 'INWARD',
        categoriesName,
        productsName,
        date: challanDate,
        details: JSON.stringify(req.body),
        purchaseId
      });

      // Create an entry in AssetPurchase
      const newPurchase = await purchase.create({
        purchaseId: newEntries[0].purchaseId, // Assuming all entries have the same purchaseId
        oemName,
        categoriesName,
        productsName,
        purchaseDate: grnDate,
        quantity: materialRows.reduce((acc, material) => acc + material.quantity, 0),
        quantityUnits,
      });

      res.status(201).json({ message: "Entries Created Successfully" });
    } catch (error) {
      res.status(500).json({ message: 'Error creating entries', error });
    }
  });

  app.post('/asset-inventory-grn', async (req, res) => {
    try {
      console.log("req.body:::::", req.body);

      // Function to generate a unique challanId
      const generateChallanId = async () => {
        const maxChallanId = await challan.max('challanId');
        return maxChallanId ? parseInt(maxChallanId) + 1 : 1000;
      };

      const {
        grnDate,
        purchaseOrderNo: purchaseId,
        storeName,
        oemName,
        challanNo,
        challanDate,
        materialRows,
        storeAddress: storeLocation
      } = req.body;

      // Check for duplicate serial numbers within the request payload
      const serialNumbers = materialRows.map(material => material.serialNumber).filter(Boolean);
      const duplicateSerialNumbers = serialNumbers.filter((item, index) => serialNumbers.indexOf(item) !== index);

      if (duplicateSerialNumbers.length > 0) {
        return res.status(400).json({ message: `Duplicate Serial Numbers found in the Data: ${duplicateSerialNumbers.join(', ')}` });
      }

      // Generate challanId
      const challanId = await generateChallanId();
      const date = new Date();

      const categoriesName = {};
      const productsName = {};
      const quantityUnits = {};
      const newEntries = [];

      let categoryCount = 1;
      let productCount = 1;

      for (const material of materialRows) {
        const {
          categoryName,
          productName,
          quantity,
          quantityUnit,
          warrantyPeriodMonths,
          serialNumber
        } = material;

        const catInfo = await category.findOne({ where: { name: categoryName } });
        let hsnNumber = catInfo.hsnNumber;

        const warrantyStartDate = challanDate;
        const warrantyEndDate = new Date(challanDate);
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyPeriodMonths);

        categoriesName[`Category${categoryCount}`] = categoryName;
        productsName[`Product${productCount}`] = productName;
        quantityUnits[`QuantityUnit${productCount}`] = quantityUnit;
        categoryCount++;
        productCount++;
        if (!storeName) {
          return res.status(400).json({ "message": "storeName is Missing" });
        }
        const storeInfo = await stores.findOne({ where: { storeName }, raw: true, attributes: ['address'] });

        if (["Units", "KG", "Metre", "Grams", "Pieces", "Dozen", "Box", "Bag"].includes(quantityUnit)) {
          // Create multiple entries with serialNumbers
          const newEntry = await inventory.create({
            oemName,
            categoryName,
            productName,
            inventoryStoreName: storeName,
            quantityUnit,
            storeLocation: storeInfo.address,
            purchaseOrderDate: grnDate,
            serialNumber,
            warrantyPeriodMonths,
            warrantyStartDate,
            warrantyEndDate,
            purchaseId,
            status: "RECEIVED",
            challanNumber: challanNo,
            hsnNumber,
            grnDate: date
          });
          newEntries.push(newEntry);
        } else {
          // Create a single entry without serialNumbers
          const newEntry = await inventory.create({
            categoryName,
            productName,
            inventoryStoreName: storeName,
            quantity,
            quantityUnit,
            storeLocation,
            purchaseDate: grnDate,
            serialNumber: null, // Assuming serialNumber is not nullable
            warrantyPeriodMonths,
            warrantyStartDate,
            warrantyEndDate,
            purchaseId,
            status: "RECEIVED",
            challanId: challanNo
          });
          newEntries.push(newEntry);
        }
      }

      // Create an entry in AssetChallan
      const newChallan = await challan.create({
        challanId: challanId.toString(),
        challanNumber: challanNo,
        challanType: 'INWARD',
        categoriesName,
        productsName,
        date: challanDate,
        details: JSON.stringify(req.body),
        purchaseId
      });

      // Create an entry in AssetPurchase
      const newPurchase = await purchase.create({
        purchaseId: newEntries[0].purchaseId, // Assuming all entries have the same purchaseId
        oemName,
        categoriesName,
        productsName,
        purchaseDate: grnDate,
        quantity: materialRows.reduce((acc, material) => acc + material.quantity, 0),
        quantityUnits,
      });

      res.status(201).json({ message: "Entries Created Successfully" });
    } catch (error) {
      res.status(500).json({ message: 'Error creating entries', error });
    }
  });


  app.post('/old-asset-inventory-update-grn', async (req, res) => {
    try {
      console.log("req.body:::::", req.body);

      // Function to generate a unique 6-digit purchaseId
      // const generatePurchaseId = async (oemName) => {
      //   const randomNumber = Math.floor(100000 + Math.random() * 900000);
      //   return randomNumber;
      // };

      // Function to generate a unique challanId
      const generateChallanId = async () => {
        const maxChallanId = await challan.max('challanId');
        return maxChallanId ? parseInt(maxChallanId) + 1 : 1000;
      };
      const grnDate = new Date()

      const {
        purchaseId,
        oemName,
        challanNo,
        challanDate,
        materialRows
      } = req.body;
      const { storeAddress: storeLocation } = req.body.material;
      const { material } = req.body
      const { storeName: inventoryStoreName } = material;

      // Generate challanId
      const challanId = await generateChallanId();
      const newEntries = [];



      for (const material of materialRows) {
        const {
          categoryName,
          productName,
          quantity,
          quantityUnit,
          warrantyPeriodMonths,
          serialNumber
        } = material;
        console.log(serialNumber);

        const catInfo = await category.findOne({ where: { name: categoryName } })
        let hsnNumber = catInfo.hsnNumber


        // Generate a unique purchaseId

        const warrantyStartDate = challanDate;
        const warrantyEndDate = new Date(challanDate);
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyPeriodMonths);



        console.log(oemName);

        // Create multiple entries with serialNumbers
        // for (const serialNumber of serialNumbers) {
        const newEntry = await inventory.create({
          oemName,
          categoryName,
          productName,
          inventoryStoreName,
          quantityUnit,
          storeLocation,
          purchaseDate: grnDate,
          serialNumber,
          warrantyPeriodMonths,
          warrantyStartDate,
          warrantyEndDate,
          purchaseId,
          status: "RECEIVED",
          challanNumber: challanNo,
          hsnNumber
        });
        newEntries.push(newEntry);
        // }

      }

      // Create an entry in AssetChallan
      const newChallan = await challan.create({
        challanId: challanId.toString(),
        challanNumber: challanNo,
        challanType: 'INWARD',
        date: challanDate,
        details: JSON.stringify(req.body),
        purchaseId
      });

      res.status(201).json({ message: "Entries Created Successfully" });
    } catch (error) {
      res.status(500).json({ message: 'Error creating entries', error });
    }
  });

  app.post('/asset-inventory-update-grn', async (req, res) => {
    try {
      console.log("req.body:::::", req.body);

      // Function to generate a unique challanId
      const generateChallanId = async () => {
        const maxChallanId = await challan.max('challanId');
        return maxChallanId ? parseInt(maxChallanId) + 1 : 1000;
      };
      const grnDate = new Date();

      const {
        purchaseId,
        oemName,
        challanNo,
        challanDate,
        materialRows,
        material
      } = req.body;

      const { storeName: inventoryStoreName } = material;
      const storeData = await stores.findOne({ where: { storeName: inventoryStoreName }, raw: true, attributes: ['address'] });
      const storeLocation = storeData ? storeData.address : null;

      // Check for duplicate serial numbers within the request payload
      const serialNumbers = materialRows.map(material => material.serialNumbers).flat().filter(Boolean);
      const duplicateSerialNumbers = serialNumbers.filter((item, index) => serialNumbers.indexOf(item) !== index);

      if (duplicateSerialNumbers.length > 0) {
        return res.status(400).json({ message: `Duplicate Serial Numbers found in the Data: ${duplicateSerialNumbers.join(', ')}` });
      }
      if (!purchaseId) {
        return res.status(400).json({ "message": "Purchase Order is Missing Please select the P.O." });
      }
      const purchaseData = await purchase.findOne({ where: { purchaseId }, raw: true, attributes: ['purchaseDate'] });

      // Generate challanId
      const challanId = await generateChallanId();
      const newEntries = [];

      for (const material of materialRows) {
        const {
          categoryName,
          productName,
          quantity,
          quantityUnit,
          warrantyPeriodMonths,
          serialNumbers
        } = material;

        const catInfo = await category.findOne({ where: { name: categoryName } });
        const hsnNumber = catInfo ? catInfo.hsnNumber : null;

        const warrantyStartDate = new Date(challanDate);
        const warrantyEndDate = new Date(challanDate);
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyPeriodMonths);
        const date = new Date();

        for (const serialNumber of serialNumbers) {
          const newEntry = await inventory.create({
            oemName,
            purchaseOrderDate: purchaseData.purchaseDate,
            categoryName,
            productName,
            inventoryStoreName,
            quantityUnit,
            storeLocation,
            purchaseDate: grnDate,
            serialNumber,
            warrantyPeriodMonths,
            warrantyStartDate,
            warrantyEndDate,
            purchaseId,
            status: "RECEIVED",
            challanNumber: challanNo,
            hsnNumber,
            grnDate: date
          });
          newEntries.push(newEntry);
        }
      }

      // Create an entry in AssetChallan
      const newChallan = await challan.create({
        challanId: challanId.toString(),
        challanNumber: challanNo,
        challanType: 'INWARD',
        date: challanDate,
        details: JSON.stringify(req.body),
        purchaseId
      });

      res.status(201).json({ message: "Entries Created Successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error creating entries', error });
    }
  });

  app.post('/old-asset-inventory-dashboard', async (req, res) => {
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

      // console.log(purchaseData);
      // console.log(inventoryData);

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
          if (item.status === "IN STOCK") {
            purchaseLookup[purchaseId].usableItems++;
          }
          if (item.status === "FAILED" || item.status === "REJECTED" || item.status === "FAULTY") {
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

      res.status(200).json({ "purchaseData": Object.values(purchaseLookup) });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error fetching asset inventory summary', error });
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
        attributes: ['purchaseId', 'categoryName', 'productName', 'status', 'challanNumber'],
        raw: true
      });
      // Create a lookup table for purchase data
      const purchaseLookup = {};
      purchaseData.forEach(purchase => {
        purchaseLookup[purchase.purchaseId] = {
          purchaseId: purchase.purchaseId,
          oemName: purchase.oemName,
          purchaseDate: purchase.purchaseDate,
          challanData: {}
        };
      });
      // Group inventory data by challanNumber
      inventoryData.forEach(item => {
        const { purchaseId, challanNumber, categoryName, productName, status } = item;
        if (!purchaseLookup[purchaseId].challanData[challanNumber]) {
          purchaseLookup[purchaseId].challanData[challanNumber] = {
            challanNumber,
            categoryName: '',
            productName: '',
            totalItems: 0,
            usableItems: 0,
            nonUsableItems: 0,
            underQAReview: 0 // Initialize underQAReview
          };
        }
        const challanGroup = purchaseLookup[purchaseId].challanData[challanNumber];
        challanGroup.totalItems++;
        if (status === "IN STOCK") {
          challanGroup.usableItems++;
        }
        if (status === "FAILED" || status === "REJECTED" || status === "FAULTY") {
          challanGroup.nonUsableItems++;
        }
        if (status === "RECEIVED") {
          challanGroup.underQAReview++; // Increment underQAReview for "RECEIVED" status
        }
        challanGroup.productName = productName;
        challanGroup.categoryName = categoryName;
      });
      // Flatten the lookup table into the required format
      const result = [];
      Object.values(purchaseLookup).forEach(purchase => {
        Object.values(purchase.challanData).forEach(challan => {
          result.push({
            purchaseId: purchase.purchaseId,
            oemName: purchase.oemName,
            purchaseDate: purchase.purchaseDate,
            challanNumber: challan.challanNumber,
            categoryName: challan.categoryName,
            productName: challan.productName,
            totalItems: challan.totalItems,
            usableItems: challan.usableItems,
            nonUsableItems: challan.nonUsableItems,
            underQAReview: challan.underQAReview // Include underQAReview in the response
          });
        });
      });
      res.status(200).json({ purchaseData: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error fetching asset inventory summary', error });
    }
  });


  app.post('/getItemsByPurchaseId', async (req, res) => {
    const { purchaseId } = req.body;
    console.log(req.body);
    console.log(purchaseId);

    try {
      if (!purchaseId) {
        return res.status(400).json({ error: 'purchaseId is required' });
      }
      //attributes: ['categoryName', 'oemName', 'productName', 'status', 'warrantyStartDate', 'warrantyEndDate', 'serialNumber', 'inventoryStoreName', 'storeLocation','challanNumber']

      const items = await inventory.findAll({
        where: { purchaseId },

      });

      if (items.length === 0) {
        return res.status(404).json({ message: 'No items found for the given purchaseId' });
      }

      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/getItemsByChallanNumber', async (req, res) => {
    const { challanNumber } = req.body;
    console.log(req.body);
    console.log(challanNumber);

    try {
      if (!challanNumber) {
        return res.status(400).json({ error: 'Challan Number is required' });
      }
      //attributes: ['categoryName', 'oemName', 'productName', 'status', 'warrantyStartDate', 'warrantyEndDate', 'serialNumber', 'inventoryStoreName', 'storeLocation','challanNumber']

      const items = await inventory.findAll({
        where: { challanNumber },

      });

      if (items.length === 0) {
        return res.status(404).json({ message: 'No items found for the given Challan Number' });
      }
      const purchaseId = items[0].purchaseId

      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  app.post('/new-getItemsByPurchaseId', async (req, res) => {
    const { purchaseId } = req.body;
    console.log(req.body);
    console.log(purchaseId);

    try {
      if (!purchaseId) {
        return res.status(400).json({ error: 'purchaseId is required' });
      }

      const items = await inventory.findAll({
        where: { purchaseId }
      });

      if (items.length === 0) {
        return res.status(404).json({ message: 'No items found for the given purchaseId' });
      }

      const groupedItems = _.chain(items)
        .groupBy('challanNumber')
        .map((value, key) => ({
          challanId: key,
          numberOfItems: value.length,
          challanNumber: value[0].challanNumber,
          warrantyStartDate: value[0].warrantyStartDate ? value[0].warrantyStartDate.toISOString().split('T')[0] : null,
          items: value
        }))
        .value();

      res.status(200).json({ items, groupedItems });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // API route to assign a testing manager for multiple entries
  app.post('/update-testing-data', async (req, res) => {
    try {
      console.log(req.body);
      const { items, engineerName } = req.body;
      // const empInfo = await Employees.findOne({ where: { employeeId }, attributes: ['firstName', 'middleName', 'lastName'] });
      // // console.log(empInfo);
      // const engineerName = `${empInfo.firstName} ${empInfo.middleName} ${empInfo.lastName}`
      // console.log(engineerName);

      // Loop through each item and update the asset
      const updatePromises = items.map(async (item) => {
        console.log("item::::::", item);
        const { categoryName, productName, serialNumber, testResult, remark: faultyRemark } = item;

        try {
          // Find the asset
          const asset = await inventory.findOne({
            where: {
              categoryName,
              productName,
              serialNumber
            }
          });

          if (asset) {
            // Determine the new status based on the test result
            const newStatus = testResult === 'FAIL' ? 'REJECTED' : 'IN STOCK';


            // Update the asset
            await inventory.update(
              {
                engineerName,
                testingResult: testResult,
                status: newStatus,
                faultyRemark
              },
              {
                where: {
                  categoryName,
                  productName,
                  serialNumber
                }
              }
            );
          } else {
            console.warn(`Asset not found for item: ${JSON.stringify(item)}`);
          }
        } catch (error) {
          console.error(`Error updating asset for item: ${JSON.stringify(item)}`, error);
        }
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      res.json({ message: 'Testing data updated for all items' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred', error });
    }
  });

  app.post('/delivery-product-list', async (req, res) => {
    try {
      const { category } = req.body;
      let whereClause = { status: 'IN STOCK' };

      if (category) {
        whereClause.categoryName = category;
      }

      const inventoryItems = await inventory.findAll({
        where: whereClause,
        attributes: ['serialNumber', 'productName', 'status', 'categoryName', 'inventoryStoreName', 'hsnNumber']
      });

      res.status(200).json({ "productData": inventoryItems });
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      res.status(500).json({ error: 'An error occurred while fetching inventory items' });
    }
  });

  app.post('/delivery-product-list-s2', async (req, res) => {
    try {
      const { clientName: client } = req.body;
      let whereClause = { status: 'SENT TO CUSTOMER WAREHOUSE' };

      if (client) {
        whereClause.client = client;
      }

      const inventoryItems = await inventory.findAll({
        where: whereClause,
        attributes: ['serialNumber', 'productName', 'status', 'categoryName', 'client', 'clientWarehouse']
      });

      res.status(200).json({ "productData": inventoryItems });
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      res.status(500).json({ error: 'An error occurred while fetching inventory items' });
    }
  });

  app.post('/update-delivery-data-s1', async (req, res) => {
    console.log(req.body);
    const { deliveryDetails } = req.body;
    const { selectedClient: client } = req.body;
    const { selectedWarehouse: clientWarehouse } = req.body;
    const status = "SENT TO CUSTOMER WAREHOUSE"
    const { items } = deliveryDetails;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid product data' });
    }

    try {
      const deliveryDate = new Date();

      for (const item of items) {
        const { serialNumbers, productName } = item;
        const serialNumber = serialNumbers[0];

        if (!serialNumber || !productName) {
          return res.status(400).json({ error: 'Invalid product data format' });
        }

        const updated = await inventory.update(
          { client, clientWarehouse, deliveryDate, status },
          {
            where: {
              serialNumber,
              productName
            }
          }
        );
      }

      res.status(200).json({ "message": "Data Delivered Successfully" });

    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ error: 'An error occurred while updating inventory items' });
    }
  });

  app.post('/update-delivery-data-s2', async (req, res) => {
    console.log(req.body);
    const { deliveryDetails } = req.body;
    const status = "DELIVERED TO SITE";
    const { products } = deliveryDetails;
    const { site } = deliveryDetails;
    const { siteName } = site;
    const deliveryDate = new Date();

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Invalid product data' });
    }

    try {

      for (const product of products) {
        const { serialNumber, productName } = product;

        if (!serialNumber || !productName) {
          return res.status(400).json({ error: 'Invalid product data format' });
        }

        const updated = await inventory.update(
          { siteName, status, deliveryDate },
          {
            where: {
              serialNumber,
              productName
            }
          }
        );
      }

      res.status(200).json({ "message": "Data Updated Successfully" });

    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ error: 'An error occurred while updating inventory items' });
    }
  });

  // Fetch assets with specific fields where status is RECEIVED
  app.post('/quality-assurance-dashboard', async (req, res) => {
    try {
      const assets = await inventory.findAll({
        attributes: ['categoryName', 'oemName', 'productName', 'serialNumber', 'challanNumber', 'status'],
        where: {
          status: 'RECEIVED'
        }
      });

      res.status(200).json(assets);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching assets', error: error.message });
    }
  });

  app.post('/scrap-managemet-dashboard', async (req, res) => {
    try {
      const assets = await inventory.findAll({
        attributes: ['categoryName', 'oemName', 'productName', 'serialNumber', 'challanNumber', 'status'],
        where: {
          status: 'SCRAP'
        }
      });

      res.status(200).json(assets);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching assets', error: error.message });
    }
  });

  app.post('/grid-view-dashboard', async (req, res) => {
    try {
      const assets = await inventory.findAll({
        attributes: ['categoryName', 'oemName', 'productName', 'siteName', 'serialNumber', 'status', 'warrantyStartDate', 'warrantyEndDate', 'deliveryDate', 'client', 'clientWarehouse', 'engineerName', 'faultyRemark'],
        where: {
          status: {
            [Sequelize.Op.in]: ['RECEIVED', 'IN USE', 'FAULTY', 'SCRAP', 'IN STOCK', 'REJECTED', 'DELIVERED', 'RETURN TO OEM', 'RETURN TO SITE', 'SENT TO CUSTOMER WAREHOUSE', 'DELIVERED TO SITE']  // Example values
          }
        }


      });

      // Process the dates to remove the time part
      const processedAssets = assets.map(asset => {
        const warrantyStartDate = asset.warrantyStartDate ? asset.warrantyStartDate.toISOString().split('T')[0] : null;
        const warrantyEndDate = asset.warrantyEndDate ? asset.warrantyEndDate.toISOString().split('T')[0] : null;
        const deliveryDate = asset.deliveryDate ? asset.deliveryDate.toISOString().split('T')[0] : null;

        return {
          ...asset.dataValues,
          warrantyStartDate,
          warrantyEndDate,
          deliveryDate
        };
      });

      res.status(200).json(processedAssets);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching assets', error: error.message });
    }
  });

  // app.post('/faulty-asset-action', async (req, res) => {
  //   console.log("req.body", req.body);
  //   const { assetsData } = req.body;

  //   if (!Array.isArray(assetsData) || assetsData.length === 0) {
  //     return res.status(400).json({ message: 'Invalid or empty data array' });
  //   }

  //   try {
  //     for (const assetData of assetsData) {
  //       const { productName, serialNumber, action } = assetData;
  //       console.log("productName", productName);
  //       console.log("serialNumber", serialNumber);
  //       console.log("action", action);

  //       // Determine the new status based on the action
  //       let newStatus;
  //       switch (action) {
  //         case 'Mark as Scrap':
  //           newStatus = 'SCRAP';
  //           break;
  //         case 'Sent Back to the OEM':
  //           newStatus = 'RETURN TO OEM';
  //           break;
  //         case 'Sent Back to the Site':
  //           newStatus = 'RETURN TO SITE';
  //           break;
  //         case 'Delivered':
  //           newStatus = "DELIVERED TO SITE";
  //           break;
  //         case 'Return under inspection':
  //           newStatus = "RETURN UNDER INSPECTION";  
  //           break;
  //         default:
  //           // Skip invalid actions
  //           continue;
  //       }
  //       console.log("new Status", newStatus);

  //       // Update the asset status
  //       await inventory.update(
  //         { status: newStatus },
  //         {
  //           where: {
  //             productName,
  //             serialNumber
  //           }
  //         }
  //       );
  //     }

  //     res.status(200).json({ message: 'Assets status updated successfully' });
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error updating asset statuss', error: error.message });
  //   }
  // });


  app.post('/faulty-asset-action', async (req, res) => {
    console.log("req.body", req.body);
    const { assetsData } = req.body;
  
    if (!Array.isArray(assetsData) || assetsData.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty data array' });
    }
  
    try {
      for (const assetData of assetsData) {
        const { productName, serialNumber, action, descriptionOfIssue } = assetData;
        console.log("productName", productName);
        console.log("serialNumber", serialNumber);
        console.log("action", action);
        console.log("descriptionOfIssue", descriptionOfIssue);
  
        // Determine the new status based on the action
        let newStatus;
        switch (action) {
          case 'Mark as Scrap':
            newStatus = 'SCRAP';
            break;
          case 'Sent Back to the OEM':
            newStatus = 'RETURN TO OEM';
            break;
          case 'Sent Back to the Site':
            newStatus = 'RETURN TO SITE';
            break;
          case 'Delivered':
            newStatus = "DELIVERED TO SITE";
            break;
          case 'Return under inspection':
            newStatus = "RETURN UNDER INSPECTION";  
            break;
          default:
            // Skip invalid actions
            continue;
        }
        console.log("new Status", newStatus);
  
        // Update the asset status and faultyRemarks
        await inventory.update(
          {
            status: newStatus,
            faultyRemark: descriptionOfIssue // Updating faultyRemarks column
          },
          {
            where: {
              productName,
              serialNumber
            }
          }
        );
      }
  
      res.status(200).json({ message: 'Assets status and remarks updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating asset status', error: error.message });
    }
  });
  

  app.post('/faulty-asset-dashboard', async (req, res) => {
    try {
      const assets = await inventory.findAll({
        attributes: ['serialNumber', 'productName', 'warrantyStartDate', 'warrantyEndDate', 'siteName', 'status', 'oemName', 'hsnNumber', 'client', 'clientWarehouse','purchaseId','challanNumber','faultyRemark'],
        where: {
          status: ['IN STOCK', 'DELIVERED TO SITE', 'RETURN TO OEM', 'RETURN TO SITE', 'SCRAP', 'SENT TO CUSTOMER WAREHOUSE', 'REJECTED','RETURN UNDER INSPECTION']
        }
      });
      console.log(assets);

      const formattedAssets = assets.map(asset => ({
        serialNumber: asset.serialNumber,
        productName: asset.productName,
        warrantyStartDate: asset.warrantyStartDate ? asset.warrantyStartDate.toISOString().split('T')[0] : null,
        warrantyEndDate: asset.warrantyEndDate ? asset.warrantyEndDate.toISOString().split('T')[0] : null,
        siteName: asset.siteName,
        status: asset.status,
        hsnNumber: asset.hsnNumber,
        client: asset.client,
        clientWarehouse: asset.clientWarehouse,
        purchaseOrder:asset.purchaseId,
        challanNo:asset.challanNumber,
        remarks:asset.faultyRemark
      }));

      res.json(formattedAssets);
    } catch (error) {
      res.status(500).send({
        message: error.message || "Some error occurred while retrieving assets."
      });
    }
  });

  app.post('/scrap-management-action', async (req, res) => {
    try {
      const { serialNumber, oemName, productName, status, categoryName, challanNumber } = req.body;
      const asset = await inventory.findOne({
        where: { serialNumber, productName, oemName, categoryName, challanNumber }
      });

      if (!asset) {
        return res.status(404).json({ error: `Asset with serial number ${serialNumber} and product name ${productName} not found` });
      }

      if (status === 'In Stock') {
        await inventory.update(
          { status: 'IN STOCK' },
          { where: { serialNumber, productName, oemName, categoryName, challanNumber } }
        );
      }


      res.status(200).json({ message: 'Assets updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // API to store multiple AssetClient entries
  app.post('/asset-client', async (req, res) => {
    try {
      const { data } = req.body;
      console.log(req.body);

      // Function to generate new clientId
      const getNewClientId = async () => {
        const maxClient = await client.max('clientId');
        return maxClient ? maxClient + 1 : 1000;
      };

      const newClients = [];

      for (const c of data) {
        const { client: name } = c;
        if (!name) {
          return res.status(400).json({ "Message": "Client Name must not be empty" })
        }

        // Check if clientId already exists
        const existingClient = await client.findOne({ where: { name } });
        if (existingClient) {
          return res.status(400).json({ message: `Client Name ${name} already exists` });
        }

        // Get new clientId if not provided
        const newClientId = await getNewClientId();

        // Create new client
        const newClient = await client.create({
          clientId: newClientId,
          name
        });

        newClients.push(newClient);
      }

      res.status(201).json(newClients);
    } catch (error) {
      res.status(500).json({ message: 'Error creating clients', error });
    }
  });


  // API to store multiple AssetWarehouse entries
  // app.post('/asset-warehouse', async (req, res) => {
  //   try {
  //     const { data } = req.body;
  //     console.log(req.body);

  //     // Function to generate new id
  //     const getNewId = async () => {
  //       const maxId = await warehouse.max('warehouseId');
  //       return maxId ? maxId + 1 : 1000;
  //     };

  //     const newWarehouses = [];

  //     for (const w of data) {
  //       const { warehouse: name, client: clientName } = w;
  //       if (!name) {
  //         return res.status(400).json({ "message": "Warehouse Name must not be empty" })
  //       }

  //       // Check if name already exists
  //       const existingWarehouse = await warehouse.findOne({ where: { name } });
  //       if (existingWarehouse) {
  //         return res.status(400).json({ message: `Warehouse name ${name} already exists` });
  //       }
  //       if (!name) {
  //         return res.status(400).json({ message: `Warehouse name should not be Empty` });
  //       }

  //       // Get new id
  //       const newId = await getNewId();

  //       // Create new warehouse
  //       const newWarehouse = await warehouse.create({
  //         warehouseId: newId,
  //         name,
  //         clientName,
  //         gstNo,
  //         panNo
  //       });

  //       newWarehouses.push(newWarehouse);
  //     }

  //     res.status(201).json(newWarehouses);
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error creating warehouses', error });
  //   }
  // });

  app.post('/asset-warehouse', async (req, res) => {
    try {
      const { data } = req.body;
      console.log(req.body);
  
      // Function to generate new id
      const getNewId = async () => {
        const maxId = await warehouse.max('warehouseId');
        return maxId ? maxId + 1 : 1000;
      };
  
      const newWarehouses = [];
  
      for (const w of data) {
        const { name: clientName, address: name, gstNo, panNo } = w;
  
        // Validate that name and address are not empty
        if (!clientName || !name) {
          return res.status(400).json({ message: "Client Name and Warehouse Address must not be empty" });
        }
  
        // Check if a warehouse with the same address (stored in name) already exists
        const existingWarehouse = await warehouse.findOne({ where: { name } });
        if (existingWarehouse) {
          return res.status(400).json({ message: `Warehouse address ${name} already exists` });
        }
  
        // Get new warehouseId
        const newId = await getNewId();
  
        // Create new warehouse entry
        const newWarehouse = await warehouse.create({
          warehouseId: newId,
          name,           // Address is being stored in the "name" column
          clientName,     // Client name is being stored in the "clientName" column
          gstNo,
          panNo
        });
  
        newWarehouses.push(newWarehouse);
      }
  
      // Respond with the newly created warehouses
      res.status(201).json(newWarehouses);
    } catch (error) {
      console.error('Error creating warehouses:', error);
      res.status(500).json({ message: 'Error creating warehouses', error });
    }
  });
  

  // API to retrieve all AssetClient entries
  app.post('/asset-client-dropdown', async (req, res) => {
    try {
      const assetClients = await client.findAll({
        attributes: ['clientId', 'name']
      });

      res.status(200).send(assetClients);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // API to retrieve all AssetWarehouse entries
  app.post('/asset-warehouse-dropdown', async (req, res) => {
    try {
      console.log(req.body);
      const { clientName } = req.body;
      const assetWarehouses = await warehouse.findAll({ where: { clientName } });
      res.status(200).send(assetWarehouses);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  app.post('/asset-warehouse-dropdown-all', async (req, res) => {
    try {
      console.log(req.body);
      const { clientName } = req.body;
      const assetWarehouses = await warehouse.findAll({ attributes: ['warehouseId', 'name', 'clientName','gstNo','panNo'] });
      res.status(200).send(assetWarehouses);
    } catch (error) {
      res.status(500).send(error);
    }
  });
   app.post('/getChallanNumByPurchaseId', async (req, res) => {
    try {
      const { purchaseId } = req.body; // Destructure purchaseId from req.body
      if (!purchaseId) {
        return res.status(400).json({ message: 'Purchase ID is required' });
      }

      // Find all records matching the purchaseId and get distinct challanNumbers
      const data = await inventory.findAll({
        where: { purchaseId },
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('challanNumber')), 'challanNumber']]
      });

      // Extract the challanNumbers from the data
      const distinctChallanNumbers = data.map(item => item.challanNumber);

      // Return the distinct challanNumbers in the response
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/old-update-asset-data', async (req, res) => {
    try {
      const { option, newName, Id } = req.body;

      if (!option || !newName) {
        return res.status(400).json({ message: 'Invalid request data' });
      }

      switch (option) {
        case 'Category':
          const data = await category.findOne({ where: { categoryId: Id } });
          const oldName = data.name;
          const updateCategoryRow = await category.update(
            { name: newName },
            { where: { categoryId: Id } }
          );

          if (updateCategoryRow === 0) {
            console.log('No user found with the given ID.');
          } else {
            const updateInventoryRows = await inventory.update(
              { categoryName: newName },
              { where: { categoryName: oldName } }
            );
            if (updateInventoryRows === 0) {
              console.log('Inventory rows Category Name is not updated or there is no row having that category name')
            }
            else {
              console.log('Inventory rows Category Name is updated Successfully');
            }
          }
          break;
        case 'Warehouse':
          await stores.destroy({ where: { storeName: names } });
          break;
        case 'Customer Warehouse':
          await warehouse.destroy({ where: { name: names } });
          break;
        case 'Customer':
          await client.destroy({ where: { name: names } });
          break;
        case 'OEM':
          await oem.destroy({ where: { oemName: names } });
          break;
        case 'Installation Site':
          await site.destroy({ where: { siteName: names } });
          break;
        default:
          return res.status(400).json({ message: 'Invalid option' });
      }

      res.status(200).json({ message: 'Rows Updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/update-asset-data', async (req, res) => {
    try {
      console.log("PAYLOAD:", req.body);
      const { option, item } = req.body;
      // const { option, newName, Id, address } = req.body;
      // const{name:newName} = item;
      // const{id:newName} = item;
      // const{name:newName} = item;
      if (!option || !item) {
        return res.status(400).json({ message: 'Invalid request data' });
      }
      switch (option) {
        case 'Category':
          const catId = item.categoryId;
          const newCatName = item.name;
          const newhsn = item.hsnNumber;
          const categoryData = await category.findOne({ where: { categoryId: catId } });
          if (!categoryData) {
            return res.status(404).json({ message: 'Category not found' });
          }
          const oldCategoryName = categoryData.name;
          const oldCategoryHsn = categoryData.hsnNumber;
          const updateCategoryRow = await category.update(
            { name: newCatName, hsnNumber: newhsn },
            { where: { categoryId: catId } }
          );
          if (updateCategoryRow[0] === 0) {
            console.log('No category found with the given ID.');
          } else {
            const updateInventoryRows = await inventory.update(
              { categoryName: newCatName, hsnNumber: newhsn },
              { where: { categoryName: oldCategoryName, hsnNumber: oldCategoryHsn } }
            );
            if (updateInventoryRows[0] === 0) {
              console.log('Inventory rows Category Name is not updated or there is no row having that category name');
            } else {
              console.log('Inventory rows Category Name is updated Successfully');
            }
          }
          break;
        case 'Warehouse'://Store
        const storeID = item.storeId;
        const newStoreName = item.storeName;
        const newStoreAddress = item.address;
          const warehouseData = await stores.findOne({ where: { storeId: storeID } });
          if (!warehouseData) {
            return res.status(404).json({ message: 'Warehouse not found' });
          }
          const oldWarehouseName = warehouseData.storeName;
          const oldWarehouseAddress = warehouseData.address;
          const updateCondition = { storeName: newStoreName }
          if (newStoreAddress) {
            updateCondition['address'] = newStoreAddress;
          }
          const updateWarehouseRow = await stores.update(
            updateCondition,
            { where: { storeId: storeID } }
          );
          if (updateWarehouseRow[0] === 0) {
            console.log('No warehouse found with the given ID.');
          } else {
            const updateCondition = { inventoryStoreName: newStoreName }
            if (newStoreAddress) {
              updateCondition['storeLocation'] = newStoreAddress;
            }
            const updateInventoryRows = await inventory.update(
              updateCondition,
              { where: { inventoryStoreName: oldWarehouseName, storeLocation: oldWarehouseAddress } }
            );
            if (updateInventoryRows[0] === 0) {
              console.log('Inventory rows Store Name is not updated or there is no row having that store name');
            } else {
              console.log('Inventory rows Store Name is updated Successfully');
            }
          }
          break;
        case 'Customer Warehouse'://Warehouse
        const warehouseID = item.warehouseId;
        const newWarehouseName = item.name;
        const newPanNo = item.panNo;
        const newGstNo = item.gstNo;
          const customerWarehouseData = await warehouse.findOne({ where: { warehouseId: warehouseID } });
          if (!customerWarehouseData) {
            return res.status(404).json({ message: 'Customer Warehouse not found' });
          }
          const oldCustomerWarehouseName = customerWarehouseData.name;
          const updateCustomerWarehouseRow = await warehouse.update(
            { name: newWarehouseName, gstNo: newGstNo, panNo: newPanNo },
            { where: { warehouseId: warehouseID } }
          );
          if (updateCustomerWarehouseRow[0] === 0) {
            console.log('No customer warehouse found with the given ID.');
          } else {
            const updateInventoryRows = await inventory.update(
              { clientWarehouse: newWarehouseName, gstNo: newGstNo, panNo: newPanNo },
              { where: { clientWarehouse: oldCustomerWarehouseName } }
            );
            if (updateInventoryRows[0] === 0) {
              console.log('Inventory rows Warehouse Name is not updated or there is no row having that warehouse name');
            } else {
              console.log('Inventory rows Warehouse Name is updated Successfully');
            }
          }
          break;
        case 'Customer'://Client
        const clientID = item.clientId;
        const clientNewName = item.name;
          const customerData = await client.findOne({ where: { clientId: clientID } });
          if (!customerData) {
            return res.status(404).json({ message: 'Customer not found' });
          }
          const oldCustomerName = customerData.name;
          const updateCustomerRow = await client.update(
            { name: clientNewName },
            { where: { clientId: clientID } }
          );
          const updateCustomerWarehouserow = await warehouse.update(
            { clientName: clientNewName },
            { where: { clientName: oldCustomerName } }
          );
          if (updateCustomerRow[0] === 0) {
            console.log('No customer found with the given ID.');
          } else {
            const updateInventoryRows = await inventory.update(
              { client: clientNewName },
              { where: { client: oldCustomerName } }
            );
            if (updateInventoryRows[0] === 0) {
              console.log('Inventory rows Client Name is not updated or there is no row having that client name');
            } else {
              console.log('Inventory rows Client Name is updated Successfully');
            }
          }
          break;
        case 'OEM'://OEM
          const oemId = item.oemId;
          const oemAddress = item.address
          const oemNewName = item.oemName
          const oemPanNo=item.panNo
          const oemGstNo=item.gstNo

          const oemData = await oem.findOne({ where: { oemId: oemId } });
          if (!oemData) {
            return res.status(404).json({ message: 'OEM not found' });
          }
          const oldOemName = oemData.oemName;
          const updateOemRow = await oem.update(
            { oemName: oemNewName,address:oemAddress, panNo: oemPanNo, gstNo: oemGstNo },
            { where: { oemId: oemId } }
          );
          if (updateOemRow[0] === 0) {
            console.log('No OEM found with the given ID.');
          } else {
            const updateInventoryRows = await inventory.update(
              { oemName: oemNewName },
              { where: { oemName: oldOemName } }
            );
            const updatePurchaseTable = await purchase.update(
              {oemName:oemNewName},
              {where:{oemName: oldOemName}}
            )
            if (updateInventoryRows[0] === 0) {
              console.log('Inventory rows OEM Name is not updated or there is no row having that OEM name');
            } else {
              console.log('Inventory rows OEM Name is updated Successfully');
            }
            if (updatePurchaseTable[0] === 0) {
              console.log('Purchase rows OEM Name is not updated or there is no row having that OEM name');
            } else {
              console.log('Purchase rows OEM Name is updated Successfully');
            }
          }
          break;
        case 'Installation Site'://Site
          const siteID = item.siteId;
          const siteAddress = item.address;
          const newSiteName = item.siteName;
          const installationSitePanNo=item.panNo
          const installationGstNo=item.gstNo

          const siteData = await site.findOne({ where: { siteId: siteID } });
          if (!siteData) {
            return res.status(404).json({ message: 'Installation Site not found' });
          }
          const oldSiteName = siteData.siteName;
          const updateSiteRow = await site.update(
            { siteName: newSiteName ,address:siteAddress, panNo: installationSitePanNo, gstNo: installationGstNo},
            { where: { siteId: siteID } }
          );
          if (updateSiteRow[0] === 0) {
            console.log('No installation site found with the given ID.');
          } else {
            const updateInventoryRows = await inventory.update(
              { siteName: newSiteName },
              { where: { siteName: oldSiteName } }
            );
            if (updateInventoryRows[0] === 0) {
              console.log('Inventory rows Site Name is not updated or there is no row having that site name');
            } else {
              console.log('Inventory rows Site Name is updated Successfully');
            }
          }
          break;
          case 'Engineer':
        const engineerId = item.engineerId;
        const engineerNewName = item.name;
        const engineerData = await engineer.findOne({ where: { engineerId: engineerId } });
        if (!engineerData) {
          return res.status(404).json({ message: 'Engineer not found' });
        }
        const oldEngineerName = engineerData.name;
        const updateEngineerRow = await engineer.update(
          { name: engineerNewName },
          { where: { engineerId: engineerId } }
        );
        if (updateEngineerRow[0] !== 0) {
          // await tasks.update(
          //   { engineerName: engineerNewName },
          //   { where: { engineerName: oldEngineerName, permissionName: permissionName } }
          // );
          await inventory.update(
            { engineerName: engineerNewName },
            { where: { engineerName: oldEngineerName } }
          );
        }
        break;
        default:
          return res.status(400).json({ message: 'Invalid option' });
      }
      res.status(200).json({ message: 'Rows updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  app.post('/purchaseId-dropdown', async (req, res) => {
    try {
      // Fetch distinct purchaseId and the corresponding oemName from inventory table
      const oemAndPurchaseId = await inventory.findAll({
        attributes: [
          [Sequelize.fn('DISTINCT', Sequelize.col('purchaseId')), 'purchaseId'],
          'oemName'
        ],
        raw: true
      });

      res.status(200).json(oemAndPurchaseId);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error fetching distinct purchase IDs and OEM names', error });
    }
  });

  app.post('/replacement-product-list', async (req, res) => {
    try {
      const assets = await inventory.findAll({
        attributes: [
          'serialNumber', 
          'productName', 
          'warrantyStartDate', 
          'warrantyEndDate', 
          'siteName', 
          'status', 
          'oemName', 
          'hsnNumber', 
          'client', 
          'clientWarehouse',
          'purchaseId',
          'challanNumber',
          'faultyRemark'
        ],
        where: {
          status: 'RETURN TO OEM'  // Updated condition to fetch only assets with this status
        }
      });
  
      console.log(assets);
  
      // Format the results to avoid timezone issues with dates
      const formattedAssets = assets.map(asset => ({
        serialNumber: asset.serialNumber,
        productName: asset.productName,
        warrantyStartDate: asset.warrantyStartDate ? asset.warrantyStartDate.toISOString().split('T')[0] : null,
        warrantyEndDate: asset.warrantyEndDate ? asset.warrantyEndDate.toISOString().split('T')[0] : null,
        siteName: asset.siteName,
        status: asset.status,
        hsnNumber: asset.hsnNumber,
        client: asset.client,
        clientWarehouse: asset.clientWarehouse,
        purchaseOrder: asset.purchaseId,
        challanNo: asset.challanNumber,
        remarks: asset.faultyRemark
      }));
  
      res.json(formattedAssets);
    } catch (error) {
      res.status(500).send({
        message: error.message || "Some error occurred while retrieving assets."
      });
    }
  });
  
  
  app.use("/", apiRoutes);
}


// const express = require("express");
// const _ = require('underscore');
// const Sequelize = require("sequelize");
// const nodemailer = require("nodemailer");
// const smtp = require("../../config/main.js");
// const db = require("../../config/db.config.js");
// var apiRoutes = express.Router();
// const fs = require('fs');
// const { isNull, concat, entries, attempt } = require("lodash");
// const { raw } = require("body-parser");
// const { log } = require("console");
// const category = db.AssetCategory
// const challan = db.AssetChallan
// const engineer = db.AssetEngineer
// const inventory = db.AssetInventory
// const client = db.AssetClient
// const model = db.AssetModel
// const stores = db.AssetStore
// const warehouse = db.AssetWarehouse
// const oem = db.AssetOem
// const project = db.AssetProject
// const purchase = db.AssetPurchase
// const site = db.AssetSite
// const Employees = db.Employees;

// module.exports = function (app) {
//   let smtpAuth = {
//     user: smtp.smtpuser,
//     pass: smtp.smtppass,
//   };
//   let smtpConfig = {
//     host: smtp.smtphost,
//     port: smtp.smtpport,
//     secure: false,
//     auth: smtpAuth,
//     //auth:cram_md5
//   }
//   let transporter = nodemailer.createTransport(smtpConfig);
//   transporter.verify(function (error, success) {
//     if (error) {
//       //console.log(error);
//     } else {
//       //console.log("Server is ready to take our messages");
//     }
//   });


//   // Routes for AssetCategory
//   // app.post('/asset-category', async (req, res) => {
//   //   try {
//   //     const { name, description } = req.body;
//   //     // Function to generate new categoryId
//   //     const getNewCategoryId = async () => {
//   //       const maxCategory = await category.max('categoryId');
//   //       return maxCategory ? maxCategory + 1 : 1000;
//   //     };

//   //     // Check if name already exists
//   //     const existingCategory = await category.findOne({ where: { name } });
//   //     if (existingCategory) {
//   //       return res.status(400).json({ message: 'Category name already exists' });
//   //     }

//   //     // Get new categoryId
//   //     const newCategoryId = await getNewCategoryId();

//   //     // Create new category
//   //     const newCategory = await category.create({
//   //       categoryId: newCategoryId,
//   //       name,
//   //       description
//   //     });

//   //     res.status(201).json(newCategory);
//   //   } catch (error) {
//   //     res.status(500).json({ message: 'Error creating category', error });
//   //   }
//   // });

//   //for multiple entries
//   app.post('/asset-category', async (req, res) => {
//     try {
//       // Extract and validate the data array from the request body
//       const { data } = req.body;
//       if (!Array.isArray(data)) {
//         return res.status(400).json({ message: 'Invalid data format. Expected an array of objects.' });
//       }

//       // Function to generate new categoryId
//       const getNewCategoryId = async () => {
//         const maxCategory = await category.max('categoryId');
//         return maxCategory ? maxCategory + 1 : 1000;
//       };

//       const newCategories = [];

//       for (const cat of data) {
//         const name = cat.category;
//         const hsnNumber = cat.hsn;
//         if (!name) {
//           return res.status(400).json({ message: 'Category name is required.' });
//         }

//         // Check if name already exists
//         const existingCategory = await category.findOne({ where: { name } });
//         if (existingCategory) {
//           return res.status(400).json({ message: `Category name ${name} already exists.` });
//         }

//         // Get new categoryId
//         const newCategoryId = await getNewCategoryId();

//         // Create new category
//         const newCategory = await category.create({
//           categoryId: newCategoryId,
//           name,
//           hsnNumber

//         });

//         newCategories.push(newCategory);
//       }

//       res.status(201).json(newCategories);
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating categories', error });
//     }
//   });

//   app.post('/asset-categories-dropdown', async (req, res) => {
//     try {
//       const categories = await category.findAll({
//         attributes: ['categoryId', 'name', 'hsnNumber'],
//         order: [['name', 'ASC']]
//       });

//       res.status(200).json(categories);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching categories', error });
//     }
//   });

//   app.get('/getCategories', async (req, res) => {
//     try {
//       const categories = await category.findAll({
//         attributes: ['categoryId', 'name'],
//         order: [['name', 'ASC']]
//       });

//       res.status(200).json(categories);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching categories', error });
//     }
//   });

//   // API to create new stores
//   app.post('/asset-stores', async (req, res) => {
//     try {
//       console.log('Request body:', req.body);
//       const getNewStoreId = async () => {
//         const maxStoreId = await stores.max('storeId');
//         return maxStoreId ? maxStoreId + 1 : 1000;
//       };

//       const { permissionName, employeeIdMiddleware, employeeId, data } = req.body;

//       if (!permissionName || !employeeIdMiddleware || !employeeId) {
//         console.log('Missing required fields:', { permissionName, employeeIdMiddleware, employeeId });
//         return res.status(400).json({ message: 'Permission name, employeeIdMiddleware, and employeeId must not be empty' });
//       }

//       const newStores = [];

//       for (const item of data) {
//         const { store } = item;
//         console.log(store);
//         const { name: storeName, address } = store;

//         console.log('Processing store:', { storeName, address });

//         if (!storeName) {
//           console.log('Store name is empty:', store);
//           return res.status(400).json({ message: 'Store name must not be empty' });
//         }

//         // Check if storeName already exists
//         const existingStore = await stores.findOne({ where: { storeName } });
//         if (existingStore) {
//           console.log('Warehouse name already exists:', storeName);
//           return res.status(400).json({ message: `Warehouse name '${storeName}' already exists` });
//         }

//         // Get new storeId
//         const newStoreId = await getNewStoreId();
//         console.log('Generated new storeId:', newStoreId);

//         // Create new store object
//         newStores.push({
//           storeId: newStoreId,
//           storeName,
//           address,
//         });
//       }

//       console.log('New stores to be created:', newStores);

//       // Bulk create new stores
//       await stores.bulkCreate(newStores);

//       res.status(201).json({ message: 'Stores created successfully', stores: newStores });
//     } catch (error) {
//       console.error('Error creating stores:', error);
//       res.status(500).json({ message: 'Error creating stores', error });
//     }
//   });

//   // API to get store IDs and names
//   app.post('/stores-dropdown', async (req, res) => {
//     try {
//       const storess = await stores.findAll({
//         attributes: ['storeId', 'storeName','address']
//       });
//       res.status(200).send(storess);
//     } catch (error) {
//       res.status(500).send({ error: error.message });
//     }
//   });

//   // Routes for AssetEngineer
//   // app.post('/asset-engineer', async (req, res) => {
//   //   try {
//   //     const { name, phone, email } = req.body;
//   //     const getNewEngineerId = async () => {
//   //       const maxEngineer = await engineer.max('engineerId');
//   //       return maxEngineer ? maxEngineer + 1 : 1000;
//   //     };

//   //     // Check if email already exists
//   //     const existingEngineer = await engineer.findOne({ where: { email } });
//   //     if (existingEngineer) {
//   //       return res.status(400).json({ message: 'Engineer email already exists' });
//   //     }

//   //     // Get new engineerId
//   //     const newEngineerId = await getNewEngineerId();

//   //     // Create new engineer
//   //     const newEngineer = await engineer.create({
//   //       engineerId: newEngineerId,
//   //       name,
//   //       phone,
//   //       email
//   //     });

//   //     res.status(201).json(newEngineer);
//   //   } catch (error) {
//   //     res.status(500).json({ message: 'Error creating engineer', error });
//   //   }
//   // });
//   //for multiple engineer entry
//   app.post('/asset-engineer', async (req, res) => {
//     try {
//       console.log("req.body", req.body);
//       const { data } = req.body;
//       console.log(data);
//       // Function to generate new engineerId
//       const getNewEngineerId = async () => {
//         const maxEngineer = await engineer.max('engineerId');
//         return maxEngineer ? maxEngineer + 1 : 1000;
//       };

//       const newEngineers = [];

//       for (const engData of data) {
//         console.log("engData", engData);
//         const name = engData.engineer; // Extract the name value

//         // Get new engineerId
//         const newEngineerId = await getNewEngineerId();

//         // Create new engineer
//         const newEngineer = await engineer.create({
//           engineerId: newEngineerId,
//           name
//         });

//         newEngineers.push(newEngineer);
//       }

//       res.status(201).json(newEngineers);
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating engineers', error });
//     }
//   });

//   app.post('/asset-engineers-dropdown', async (req, res) => {
//     try {
//       const engineers = await engineer.findAll({
//         attributes: ['engineerId', 'name'],
//         order: [['name', 'ASC']]
//       });

//       res.status(200).json(engineers);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching engineers', error });
//     }
//   });
//   // Routes for AssetModel
//   // app.post('/asset-model', async (req, res) => {
//   //   try {
//   //     const { name, description, categoryId } = req.body;
//   //     // Function to generate new modelId
//   //     const getNewModelId = async () => {
//   //       const maxModel = await model.max('modelId');
//   //       return maxModel ? maxModel + 1 : 1000;
//   //     };

//   //     // Check if name already exists
//   //     const existingModel = await model.findOne({ where: { name } });
//   //     if (existingModel) {
//   //       return res.status(400).json({ message: 'Model name already exists' });
//   //     }

//   //     // Get new modelId
//   //     const newModelId = await getNewModelId();

//   //     // Create new model
//   //     const newModel = await model.create({
//   //       modelId: newModelId,
//   //       name,
//   //       description,
//   //       categoryId
//   //     });

//   //     res.status(201).json(newModel);
//   //   } catch (error) {
//   //     res.status(500).json({ message: 'Error creating model', error });
//   //   }
//   // });
//   //for multiple model
//   app.post('/asset-model', async (req, res) => {
//     try {
//       const models = req.body; // Assume models is an array of objects [{ name: 'Model1', description: 'Description1', categoryId: 1 }, ...]

//       // Function to generate new modelId
//       const getNewModelId = async () => {
//         const maxModel = await model.max('modelId');
//         return maxModel ? maxModel + 1 : 1000;
//       };

//       const newModels = [];

//       for (const mod of models) {
//         const { name, description, categoryId } = mod;

//         // Check if name already exists
//         const existingModel = await model.findOne({ where: { name } });
//         if (existingModel) {
//           return res.status(400).json({ message: `Model name ${name} already exists` });
//         }

//         // Get new modelId
//         const newModelId = await getNewModelId();

//         // Create new model
//         const newModel = await model.create({
//           modelId: newModelId,
//           name,
//           description,
//           categoryId
//         });

//         newModels.push(newModel);
//       }

//       res.status(201).json(newModels);
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating models', error });
//     }
//   });

//   app.post('/asset-models-dropdown', async (req, res) => {
//     try {
//       const models = await model.findAll({
//         attributes: ['modelId', 'name'],
//         order: [['name', 'ASC']]
//       });

//       res.status(200).json(models);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching models', error });
//     }
//   });

//   //for multiple oems
//   app.post('/asset-oem', async (req, res) => {
//     try {
//       const { data } = req.body;
//       console.log("data", data);
//       const getNewOemId = async () => {
//         const maxOem = await oem.max('oemId');
//         return maxOem ? maxOem + 1 : 1000;
//       };
//       for (const o of data) {
//         const { name: oemName,address } = o;
//         if (!oemName) {
//           return res.status(400).json({ "message": "Oem name must not be empty" })
//         }
//         // Check if email already exists
//         const existingOem = await oem.findOne({ where: { oemName } });
//         if (existingOem) {
//           return res.status(400).json({ message: `OEM Name ${oemName} already exists` });
//         }
//         // Get new oemId
//         const newOemId = await getNewOemId();
//         // Create new OEM
//         const newOem = await oem.create({
//           oemId: newOemId,
//           oemName,
//           address
//         });
//       }
//       res.status(201).json({ "message": "Successfully Created" });
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating OEMs', error });
//     }
//   });


//   app.post('/asset-oems-dropdown', async (req, res) => {
//     try {
//       const oems = await oem.findAll({
//         attributes: ['oemId', 'oemName','address', 'panNo', 'gstNo'],
//         order: [['oemName', 'ASC']]
//       });
//       res.status(200).json(oems);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching OEMs', error });
//     }
//   });

//   // Routes for AssetProject
//   // app.post('/asset-project', async (req, res) => {
//   //   try {
//   //     const { projectName, description, startDate, endDate } = req.body;
//   //     // Function to generate new projectId
//   //     const getNewProjectId = async () => {
//   //       const maxProject = await project.max('projectId');
//   //       return maxProject ? maxProject + 1 : 1000;
//   //     };

//   //     // Check if projectName already exists
//   //     const existingProject = await project.findOne({ where: { projectName } });
//   //     if (existingProject) {
//   //       return res.status(400).json({ message: 'Project name already exists' });
//   //     }

//   //     // Get new projectId
//   //     const newProjectId = await getNewProjectId();

//   //     // Create new project
//   //     const newProject = await project.create({
//   //       projectId: newProjectId,
//   //       projectName,
//   //       description,
//   //       startDate,
//   //       endDate
//   //     });

//   //     res.status(201).json(newProject);
//   //   } catch (error) {
//   //     res.status(500).json({ message: 'Error creating project', error });
//   //   }
//   // });
//   //for multiple project
//   app.post('/asset-project', async (req, res) => {
//     try {
//       console.log(req.body);
//       const { data } = req.body;

//       // Function to generate new projectId
//       const getNewProjectId = async () => {
//         const maxProject = await project.max('projectId');
//         return maxProject ? maxProject + 1 : 1000;
//       };

//       const newProjects = [];

//       for (const p of data) {
//         const { project: projectName } = p;
//         console.log(projectName);

//         // Check if projectName already exists
//         const existingProject = await project.findOne({ where: { projectName } });
//         if (existingProject) {
//           return res.status(400).json({ message: `Project name ${projectName} already exists` });
//         }

//         // Get new projectId
//         const newProjectId = await getNewProjectId();

//         // Create new project
//         const newProject = await project.create({
//           projectId: newProjectId,
//           projectName
//         });

//         newProjects.push(newProject);
//       }

//       res.status(201).json(newProjects);
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating projects', error });
//     }
//   });

//   app.put('/asset-project/:id', async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { projectName, description, startDate, endDate } = req.body;

//       // Find the project by id
//       const project = await AssetProject.findByPk(id);
//       if (!project) {
//         return res.status(404).json({ message: 'Project not found' });
//       }

//       // Update the project
//       project.projectName = projectName || project.projectName;
//       project.description = description || project.description;
//       project.startDate = startDate || project.startDate;
//       project.endDate = endDate || project.endDate;
//       await project.save();

//       res.status(200).json(project);
//     } catch (error) {
//       res.status(500).json({ message: 'Error updating project', error });
//     }
//   });

//   app.get('/asset-projects-dropdown', async (req, res) => {
//     try {
//       const projects = await project.findAll({
//         attributes: ['projectId', 'projectName'],
//         order: [['projectName', 'ASC']]
//       });

//       res.status(200).json(projects);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching projects', error });
//     }
//   });

//   // Routes for AssetSite
//   // app.post('/asset-site', async (req, res) => {
//   //   try {
//   //     const { siteName, sitePhone, siteEmail, location } = req.body;
//   //     // Function to generate new siteId
//   //     const getNewSiteId = async () => {
//   //       const maxSite = await site.max('siteId');
//   //       return maxSite ? maxSite + 1 : 1000;
//   //     };

//   //     // Check if siteName already exists
//   //     const existingSite = await site.findOne({ where: { siteName } });
//   //     if (existingSite) {
//   //       return res.status(400).json({ message: 'Site name already exists' });
//   //     }

//   //     // Get new siteId
//   //     const newSiteId = await getNewSiteId();

//   //     // Create new site
//   //     const newSite = await site.create({
//   //       siteId: newSiteId,
//   //       siteName,
//   //       sitePhone,
//   //       siteEmail,
//   //       location
//   //     });

//   //     res.status(201).json(newSite);
//   //   } catch (error) {
//   //     res.status(500).json({ message: 'Error creating site', error });
//   //   }
//   // });
//   //for multiple sites
//   app.post('/asset-site', async (req, res) => {
//     try {
//       const { data } = req.body;
//       console.log(req.body);
//       // Function to generate new siteId
//       const getNewSiteId = async () => {
//         const maxSite = await site.max('siteId');
//         return maxSite ? maxSite + 1 : 1000;
//       };
//       const newSites = [];
//       for (const s of data) {
//         const { name: siteName,address } = s;
//         if (!siteName) {
//           return res.status(400).json({ "message": "Site name must not be empty" })
//         }
//         // Check if siteName already exists
//         const existingSite = await site.findOne({ where: { siteName } });
//         if (existingSite) {
//           return res.status(400).json({ message: `Site name ${siteName} already exists` });
//         }
//         // Get new siteId
//         const newSiteId = await getNewSiteId();
//         // Create new site
//         const newSite = await site.create({
//           siteId: newSiteId,
//           siteName,
//           address
//         });
//         newSites.push(newSite);
//       }
//       res.status(201).json(newSites);
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating sites', error });
//     }
//   });

//   app.put('/asset-site/:id', async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { siteName, sitePhone, siteEmail, location } = req.body;

//       // Find the site by id
//       const site = await AssetSite.findByPk(id);
//       if (!site) {
//         return res.status(404).json({ message: 'Site not found' });
//       }

//       // Update the site
//       site.siteName = siteName || site.siteName;
//       site.sitePhone = sitePhone || site.sitePhone;
//       site.siteEmail = siteEmail || site.siteEmail;
//       site.location = location || site.location;
//       await site.save();

//       res.status(200).json(site);
//     } catch (error) {
//       res.status(500).json({ message: 'Error updating site', error });
//     }
//   });

//   app.post('/asset-sites-dropdown', async (req, res) => {
//     try {
//       const sites = await site.findAll({
//         attributes: ['siteId', 'siteName','address','panNo', 'gstNo'],
//         order: [['siteName', 'ASC']]
//       });
//       res.status(200).json(sites);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching sites', error });
//     }
//   });

//   app.get('/getSubstations', async (req, res) => {
//     try {
//       const sites = await site.findAll({
//         attributes: ['siteId', 'siteName'],
//         order: [['siteName', 'ASC']]
//       });

//       res.status(200).json(sites);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching sites', error });
//     }
//   });

//   app.post('/old-asset-inventory-grn', async (req, res) => {
//     try {
//       console.log("req.body:::::", req.body);
//       // Function to generate a unique 6-digit purchaseId
//       const generatePurchaseId = async (oemName) => {
//         const randomNumber = Math.floor(100000 + Math.random() * 900000);
//         return randomNumber;
//       };

//       // Function to generate a unique challanId
//       const generateChallanId = async () => {
//         const maxChallanId = await challan.max('challanId');
//         return maxChallanId ? parseInt(maxChallanId) + 1 : 1000;
//       };

//       const {
//         grnDate,
//         storeName,
//         oemName,
//         challanNo,
//         challanDate,
//         materialRows
//       } = req.body;

//       // Generate challanId
//       const challanId = await generateChallanId();

//       const categoriesName = {};
//       const productsName = {};
//       const quantityUnits = {};
//       const newEntries = [];

//       let categoryCount = 1;
//       let productCount = 1;

//       for (const material of materialRows) {
//         const {
//           categoryName,
//           productName,
//           quantity,
//           quantityUnit,
//           warrantyPeriodMonths,
//           storeLocation,
//           serialNumbers
//         } = material;

//         // Generate a unique purchaseId
//         const purchaseId = await generatePurchaseId();

//         const warrantyStartDate = challanDate;
//         const warrantyEndDate = new Date(challanDate);
//         warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyPeriodMonths);

//         categoriesName[`Category${categoryCount}`] = categoryName;
//         productsName[`Product${productCount}`] = productName;
//         quantityUnits[`QuantityUnit${productCount}`] = quantityUnit;
//         categoryCount++;
//         productCount++;

//         if (["Units", "KG", "Metre", "Grams", "Pieces", "Dozen", "Box", "Bag"].includes(quantityUnit)) {
//           // Create multiple entries with serialNumbers
//           for (const serialNumber of serialNumbers) {
//             const newEntry = await inventory.create({
//               oemName,
//               categoryName,
//               productName,
//               inventoryStoreName: storeName,
//               quantityUnit,
//               storeLocation,
//               purchaseDate: grnDate,
//               serialNumber,
//               warrantyPeriodMonths,
//               warrantyStartDate,
//               warrantyEndDate,
//               purchaseId,
//               status: "RECEIVED",
//               challanNumber: challanNo
//             });
//             newEntries.push(newEntry);
//           }
//         } else {
//           // Create a single entry without serialNumbers
//           const newEntry = await inventory.create({
//             categoryName,
//             productName,
//             inventoryStoreName: storeName,
//             quantity,
//             quantityUnit,
//             storeLocation,
//             purchaseDate: grnDate,
//             serialNumber: null, // Assuming serialNumber is not nullable
//             warrantyPeriodMonths,
//             warrantyStartDate,
//             warrantyEndDate,
//             purchaseId,
//             status: "RECEIVED",
//             challanId: challanNo
//           });
//           newEntries.push(newEntry);
//         }
//       }

//       // Create an entry in AssetChallan
//       const newChallan = await challan.create({
//         challanId: challanId.toString(),
//         challanNumber: challanNo,
//         challanType: 'INWARD',
//         categoriesName,
//         productsName,
//         date: challanDate,
//         details: JSON.stringify(req.body)
//       });

//       // Create an entry in AssetPurchase
//       const newPurchase = await purchase.create({
//         purchaseId: newEntries[0].purchaseId, // Assuming all entries have the same purchaseId
//         oemName,
//         categoriesName,
//         productsName,
//         purchaseDate: grnDate,
//         quantity: materialRows.reduce((acc, material) => acc + material.quantity, 0),
//         quantityUnits
//       });

//       res.status(201).json({ message: "Entries Created Successfully" });
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating entries', error });
//     }
//   });//important 

//   app.post('/old-asset-inventory-grn', async (req, res) => {
//     try {
//       console.log("req.body:::::", req.body);

//       // Function to generate a unique 6-digit purchaseId
//       const generatePurchaseId = async (oemName) => {
//         const randomNumber = Math.floor(100000 + Math.random() * 900000);
//         return randomNumber;
//       };

//       // const purchaseId = await generatePurchaseId();
//       // Function to generate a unique challanId
//       const generateChallanId = async () => {
//         const maxChallanId = await challan.max('challanId');
//         return maxChallanId ? parseInt(maxChallanId) + 1 : 1000;
//       };

//       const {
//         grnDate,
//         purchaseOrderNo: purchaseId,
//         storeName,
//         oemName,
//         challanNo,
//         challanDate,
//         materialRows,
//         storeAddress: storeLocation
//       } = req.body;

//       // Generate challanId
//       const challanId = await generateChallanId();

//       const categoriesName = {};
//       const productsName = {};
//       const quantityUnits = {};
//       const newEntries = [];

//       let categoryCount = 1;
//       let productCount = 1;

//       for (const material of materialRows) {
//         const {
//           categoryName,
//           productName,
//           quantity,
//           quantityUnit,
//           warrantyPeriodMonths,
//           serialNumber
//         } = material;
//         const catInfo = await category.findOne({ where: { name: categoryName } })
//         let hsnNumber = catInfo.hsnNumber
//         // Generate a unique purchaseId

//         const warrantyStartDate = challanDate;
//         const warrantyEndDate = new Date(challanDate);
//         warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyPeriodMonths);

//         categoriesName[`Category${categoryCount}`] = categoryName;
//         productsName[`Product${productCount}`] = productName;
//         quantityUnits[`QuantityUnit${productCount}`] = quantityUnit;
//         categoryCount++;
//         productCount++;

//         if (["Units", "KG", "Metre", "Grams", "Pieces", "Dozen", "Box", "Bag"].includes(quantityUnit)) {
//           // Create multiple entries with serialNumbers
//           // for (const serialNumber of serialNumbers) {
//           const newEntry = await inventory.create({
//             oemName,
//             categoryName,
//             productName,
//             inventoryStoreName: storeName,
//             quantityUnit,
//             storeLocation,
//             purchaseDate: grnDate,
//             serialNumber,
//             warrantyPeriodMonths,
//             warrantyStartDate,
//             warrantyEndDate,
//             purchaseId,
//             status: "RECEIVED",
//             challanNumber: challanNo,
//             hsnNumber
//           });
//           newEntries.push(newEntry);
//           // }
//         } else {
//           // Create a single entry without serialNumbers
//           const newEntry = await inventory.create({
//             categoryName,
//             productName,
//             inventoryStoreName: storeName,
//             quantity,
//             quantityUnit,
//             storeLocation,
//             purchaseDate: grnDate,
//             serialNumber: null, // Assuming serialNumber is not nullable
//             warrantyPeriodMonths,
//             warrantyStartDate,
//             warrantyEndDate,
//             purchaseId,
//             status: "RECEIVED",
//             challanId: challanNo
//           });
//           newEntries.push(newEntry);
//         }
//       }

//       // Create an entry in AssetChallan
//       const newChallan = await challan.create({
//         challanId: challanId.toString(),
//         challanNumber: challanNo,
//         challanType: 'INWARD',
//         categoriesName,
//         productsName,
//         date: challanDate,
//         details: JSON.stringify(req.body),
//         purchaseId
//       });

//       // Create an entry in AssetPurchase
//       const newPurchase = await purchase.create({
//         purchaseId: newEntries[0].purchaseId, // Assuming all entries have the same purchaseId
//         oemName,
//         categoriesName,
//         productsName,
//         purchaseDate: grnDate,
//         quantity: materialRows.reduce((acc, material) => acc + material.quantity, 0),
//         quantityUnits,
//       });

//       res.status(201).json({ message: "Entries Created Successfully" });
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating entries', error });
//     }
//   });

//   app.post('/asset-inventory-grn', async (req, res) => {
//     try {
//       console.log("req.body:::::", req.body);

//       // Function to generate a unique challanId
//       const generateChallanId = async () => {
//         const maxChallanId = await challan.max('challanId');
//         return maxChallanId ? parseInt(maxChallanId) + 1 : 1000;
//       };

//       const {
//         grnDate,
//         purchaseOrderNo: purchaseId,
//         storeName,
//         oemName,
//         challanNo,
//         challanDate,
//         materialRows,
//         storeAddress: storeLocation
//       } = req.body;

//       // Check for duplicate serial numbers within the request payload
//       const serialNumbers = materialRows.map(material => material.serialNumber).filter(Boolean);
//       const duplicateSerialNumbers = serialNumbers.filter((item, index) => serialNumbers.indexOf(item) !== index);

//       if (duplicateSerialNumbers.length > 0) {
//         return res.status(400).json({ message: `Duplicate Serial Numbers found in the Data: ${duplicateSerialNumbers.join(', ')}` });
//       }

//       // Generate challanId
//       const challanId = await generateChallanId();
//       const date = new Date();

//       const categoriesName = {};
//       const productsName = {};
//       const quantityUnits = {};
//       const newEntries = [];

//       let categoryCount = 1;
//       let productCount = 1;

//       for (const material of materialRows) {
//         const {
//           categoryName,
//           productName,
//           quantity,
//           quantityUnit,
//           warrantyPeriodMonths,
//           serialNumber
//         } = material;

//         const catInfo = await category.findOne({ where: { name: categoryName } });
//         let hsnNumber = catInfo.hsnNumber;

//         const warrantyStartDate = challanDate;
//         const warrantyEndDate = new Date(challanDate);
//         warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyPeriodMonths);

//         categoriesName[`Category${categoryCount}`] = categoryName;
//         productsName[`Product${productCount}`] = productName;
//         quantityUnits[`QuantityUnit${productCount}`] = quantityUnit;
//         categoryCount++;
//         productCount++;
//         if (!storeName) {
//           return res.status(400).json({ "message": "storeName is Missing" });
//         }
//         const storeInfo = await stores.findOne({ where: { storeName }, raw: true, attributes: ['address'] });

//         if (["Units", "KG", "Metre", "Grams", "Pieces", "Dozen", "Box", "Bag"].includes(quantityUnit)) {
//           // Create multiple entries with serialNumbers
//           const newEntry = await inventory.create({
//             oemName,
//             categoryName,
//             productName,
//             inventoryStoreName: storeName,
//             quantityUnit,
//             storeLocation: storeInfo.address,
//             purchaseOrderDate: grnDate,
//             serialNumber,
//             warrantyPeriodMonths,
//             warrantyStartDate,
//             warrantyEndDate,
//             purchaseId,
//             status: "RECEIVED",
//             challanNumber: challanNo,
//             hsnNumber,
//             grnDate: date
//           });
//           newEntries.push(newEntry);
//         } else {
//           // Create a single entry without serialNumbers
//           const newEntry = await inventory.create({
//             categoryName,
//             productName,
//             inventoryStoreName: storeName,
//             quantity,
//             quantityUnit,
//             storeLocation,
//             purchaseDate: grnDate,
//             serialNumber: null, // Assuming serialNumber is not nullable
//             warrantyPeriodMonths,
//             warrantyStartDate,
//             warrantyEndDate,
//             purchaseId,
//             status: "RECEIVED",
//             challanId: challanNo
//           });
//           newEntries.push(newEntry);
//         }
//       }

//       // Create an entry in AssetChallan
//       const newChallan = await challan.create({
//         challanId: challanId.toString(),
//         challanNumber: challanNo,
//         challanType: 'INWARD',
//         categoriesName,
//         productsName,
//         date: challanDate,
//         details: JSON.stringify(req.body),
//         purchaseId
//       });

//       // Create an entry in AssetPurchase
//       const newPurchase = await purchase.create({
//         purchaseId: newEntries[0].purchaseId, // Assuming all entries have the same purchaseId
//         oemName,
//         categoriesName,
//         productsName,
//         purchaseDate: grnDate,
//         quantity: materialRows.reduce((acc, material) => acc + material.quantity, 0),
//         quantityUnits,
//       });

//       res.status(201).json({ message: "Entries Created Successfully" });
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating entries', error });
//     }
//   });


//   app.post('/old-asset-inventory-update-grn', async (req, res) => {
//     try {
//       console.log("req.body:::::", req.body);

//       // Function to generate a unique 6-digit purchaseId
//       // const generatePurchaseId = async (oemName) => {
//       //   const randomNumber = Math.floor(100000 + Math.random() * 900000);
//       //   return randomNumber;
//       // };

//       // Function to generate a unique challanId
//       const generateChallanId = async () => {
//         const maxChallanId = await challan.max('challanId');
//         return maxChallanId ? parseInt(maxChallanId) + 1 : 1000;
//       };
//       const grnDate = new Date()

//       const {
//         purchaseId,
//         oemName,
//         challanNo,
//         challanDate,
//         materialRows
//       } = req.body;
//       const { storeAddress: storeLocation } = req.body.material;
//       const { material } = req.body
//       const { storeName: inventoryStoreName } = material;

//       // Generate challanId
//       const challanId = await generateChallanId();
//       const newEntries = [];



//       for (const material of materialRows) {
//         const {
//           categoryName,
//           productName,
//           quantity,
//           quantityUnit,
//           warrantyPeriodMonths,
//           serialNumber
//         } = material;
//         console.log(serialNumber);

//         const catInfo = await category.findOne({ where: { name: categoryName } })
//         let hsnNumber = catInfo.hsnNumber


//         // Generate a unique purchaseId

//         const warrantyStartDate = challanDate;
//         const warrantyEndDate = new Date(challanDate);
//         warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyPeriodMonths);



//         console.log(oemName);

//         // Create multiple entries with serialNumbers
//         // for (const serialNumber of serialNumbers) {
//         const newEntry = await inventory.create({
//           oemName,
//           categoryName,
//           productName,
//           inventoryStoreName,
//           quantityUnit,
//           storeLocation,
//           purchaseDate: grnDate,
//           serialNumber,
//           warrantyPeriodMonths,
//           warrantyStartDate,
//           warrantyEndDate,
//           purchaseId,
//           status: "RECEIVED",
//           challanNumber: challanNo,
//           hsnNumber
//         });
//         newEntries.push(newEntry);
//         // }

//       }

//       // Create an entry in AssetChallan
//       const newChallan = await challan.create({
//         challanId: challanId.toString(),
//         challanNumber: challanNo,
//         challanType: 'INWARD',
//         date: challanDate,
//         details: JSON.stringify(req.body),
//         purchaseId
//       });

//       res.status(201).json({ message: "Entries Created Successfully" });
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating entries', error });
//     }
//   });

//   app.post('/asset-inventory-update-grn', async (req, res) => {
//     try {
//       console.log("req.body:::::", req.body);

//       // Function to generate a unique challanId
//       const generateChallanId = async () => {
//         const maxChallanId = await challan.max('challanId');
//         return maxChallanId ? parseInt(maxChallanId) + 1 : 1000;
//       };
//       const grnDate = new Date();

//       const {
//         purchaseId,
//         oemName,
//         challanNo,
//         challanDate,
//         materialRows,
//         material
//       } = req.body;

//       const { storeName: inventoryStoreName } = material;
//       const storeData = await stores.findOne({ where: { storeName: inventoryStoreName }, raw: true, attributes: ['address'] });
//       const storeLocation = storeData ? storeData.address : null;

//       // Check for duplicate serial numbers within the request payload
//       const serialNumbers = materialRows.map(material => material.serialNumbers).flat().filter(Boolean);
//       const duplicateSerialNumbers = serialNumbers.filter((item, index) => serialNumbers.indexOf(item) !== index);

//       if (duplicateSerialNumbers.length > 0) {
//         return res.status(400).json({ message: `Duplicate Serial Numbers found in the Data: ${duplicateSerialNumbers.join(', ')}` });
//       }
//       if (!purchaseId) {
//         return res.status(400).json({ "message": "Purchase Order is Missing Please select the P.O." });
//       }
//       const purchaseData = await purchase.findOne({ where: { purchaseId }, raw: true, attributes: ['purchaseDate'] });

//       // Generate challanId
//       const challanId = await generateChallanId();
//       const newEntries = [];

//       for (const material of materialRows) {
//         const {
//           categoryName,
//           productName,
//           quantity,
//           quantityUnit,
//           warrantyPeriodMonths,
//           serialNumbers
//         } = material;

//         const catInfo = await category.findOne({ where: { name: categoryName } });
//         const hsnNumber = catInfo ? catInfo.hsnNumber : null;

//         const warrantyStartDate = new Date(challanDate);
//         const warrantyEndDate = new Date(challanDate);
//         warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyPeriodMonths);
//         const date = new Date();

//         for (const serialNumber of serialNumbers) {
//           const newEntry = await inventory.create({
//             oemName,
//             purchaseOrderDate: purchaseData.purchaseDate,
//             categoryName,
//             productName,
//             inventoryStoreName,
//             quantityUnit,
//             storeLocation,
//             purchaseDate: grnDate,
//             serialNumber,
//             warrantyPeriodMonths,
//             warrantyStartDate,
//             warrantyEndDate,
//             purchaseId,
//             status: "RECEIVED",
//             challanNumber: challanNo,
//             hsnNumber,
//             grnDate: date
//           });
//           newEntries.push(newEntry);
//         }
//       }

//       // Create an entry in AssetChallan
//       const newChallan = await challan.create({
//         challanId: challanId.toString(),
//         challanNumber: challanNo,
//         challanType: 'INWARD',
//         date: challanDate,
//         details: JSON.stringify(req.body),
//         purchaseId
//       });

//       res.status(201).json({ message: "Entries Created Successfully" });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: 'Error creating entries', error });
//     }
//   });

//   app.post('/old-asset-inventory-dashboard', async (req, res) => {
//     try {
//       // Fetch purchase data
//       const purchaseData = await purchase.findAll({
//         attributes: ['purchaseId', 'oemName', 'purchaseDate'],
//         raw: true
//       });

//       // Fetch inventory data
//       const inventoryData = await inventory.findAll({
//         attributes: ['purchaseId', 'categoryName', 'productName', 'status'],
//         raw: true
//       });

//       // console.log(purchaseData);
//       // console.log(inventoryData);

//       // Create a lookup table for purchase data
//       const purchaseLookup = {};
//       purchaseData.forEach(purchase => {
//         purchaseLookup[purchase.purchaseId] = {
//           purchaseId: purchase.purchaseId,
//           oemName: purchase.oemName,
//           purchaseDate: purchase.purchaseDate,
//           categoryName: '', // Initialize to store later
//           productName: '', // Initialize to store later
//           totalItems: 0,
//           usableItems: 0,
//           nonUsableItems: 0
//         };
//       });

//       // Group inventory data by purchaseId
//       inventoryData.forEach(item => {
//         const purchaseId = item.purchaseId;
//         if (purchaseLookup[purchaseId]) {
//           purchaseLookup[purchaseId].totalItems++;
//           if (item.status === "IN STOCK") {
//             purchaseLookup[purchaseId].usableItems++;
//           }
//           if (item.status === "FAILED" || item.status === "REJECTED" || item.status === "FAULTY") {
//             purchaseLookup[purchaseId].nonUsableItems++;

//           }
//           // Assign productName and categoryName
//           purchaseLookup[purchaseId].productName = item.productName;
//           purchaseLookup[purchaseId].categoryName = item.categoryName;
//         }
//       });

//       // Calculate non-usable items
//       // Object.values(purchaseLookup).forEach(group => {
//       //   // group.nonUsableItems = group.totalItems - group.usableItems;
//       // });
//       const array = Object.values(purchaseLookup)

//       res.status(200).json({ "purchaseData": Object.values(purchaseLookup) });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: 'Error fetching asset inventory summary', error });
//     }
//   });

//   app.post('/asset-inventory-dashboard', async (req, res) => {
//     try {
//       // Fetch purchase data
//       const purchaseData = await purchase.findAll({
//         attributes: ['purchaseId', 'oemName', 'purchaseDate'],
//         raw: true
//       });
//       // Fetch inventory data
//       const inventoryData = await inventory.findAll({
//         attributes: ['purchaseId', 'categoryName', 'productName', 'status', 'challanNumber'],
//         raw: true
//       });
//       // Create a lookup table for purchase data
//       const purchaseLookup = {};
//       purchaseData.forEach(purchase => {
//         purchaseLookup[purchase.purchaseId] = {
//           purchaseId: purchase.purchaseId,
//           oemName: purchase.oemName,
//           purchaseDate: purchase.purchaseDate,
//           challanData: {}
//         };
//       });
//       // Group inventory data by challanNumber
//       inventoryData.forEach(item => {
//         const { purchaseId, challanNumber, categoryName, productName, status } = item;
//         if (!purchaseLookup[purchaseId].challanData[challanNumber]) {
//           purchaseLookup[purchaseId].challanData[challanNumber] = {
//             challanNumber,
//             categoryName: '',
//             productName: '',
//             totalItems: 0,
//             usableItems: 0,
//             nonUsableItems: 0,
//             underQAReview: 0 // Initialize underQAReview
//           };
//         }
//         const challanGroup = purchaseLookup[purchaseId].challanData[challanNumber];
//         challanGroup.totalItems++;
//         if (status === "IN STOCK") {
//           challanGroup.usableItems++;
//         }
//         if (status === "FAILED" || status === "REJECTED" || status === "FAULTY") {
//           challanGroup.nonUsableItems++;
//         }
//         if (status === "RECEIVED") {
//           challanGroup.underQAReview++; // Increment underQAReview for "RECEIVED" status
//         }
//         challanGroup.productName = productName;
//         challanGroup.categoryName = categoryName;
//       });
//       // Flatten the lookup table into the required format
//       const result = [];
//       Object.values(purchaseLookup).forEach(purchase => {
//         Object.values(purchase.challanData).forEach(challan => {
//           result.push({
//             purchaseId: purchase.purchaseId,
//             oemName: purchase.oemName,
//             purchaseDate: purchase.purchaseDate,
//             challanNumber: challan.challanNumber,
//             categoryName: challan.categoryName,
//             productName: challan.productName,
//             totalItems: challan.totalItems,
//             usableItems: challan.usableItems,
//             nonUsableItems: challan.nonUsableItems,
//             underQAReview: challan.underQAReview // Include underQAReview in the response
//           });
//         });
//       });
//       res.status(200).json({ purchaseData: result });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: 'Error fetching asset inventory summary', error });
//     }
//   });


//   app.post('/getItemsByPurchaseId', async (req, res) => {
//     const { purchaseId } = req.body;
//     console.log(req.body);
//     console.log(purchaseId);

//     try {
//       if (!purchaseId) {
//         return res.status(400).json({ error: 'purchaseId is required' });
//       }
//       //attributes: ['categoryName', 'oemName', 'productName', 'status', 'warrantyStartDate', 'warrantyEndDate', 'serialNumber', 'inventoryStoreName', 'storeLocation','challanNumber']

//       const items = await inventory.findAll({
//         where: { purchaseId },

//       });

//       if (items.length === 0) {
//         return res.status(404).json({ message: 'No items found for the given purchaseId' });
//       }

//       res.status(200).json(items);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

//   app.post('/getItemsByChallanNumber', async (req, res) => {
//     const { challanNumber } = req.body;
//     console.log(req.body);
//     console.log(challanNumber);

//     try {
//       if (!challanNumber) {
//         return res.status(400).json({ error: 'Challan Number is required' });
//       }
//       //attributes: ['categoryName', 'oemName', 'productName', 'status', 'warrantyStartDate', 'warrantyEndDate', 'serialNumber', 'inventoryStoreName', 'storeLocation','challanNumber']

//       const items = await inventory.findAll({
//         where: { challanNumber },

//       });

//       if (items.length === 0) {
//         return res.status(404).json({ message: 'No items found for the given Challan Number' });
//       }
//       const purchaseId = items[0].purchaseId

//       res.status(200).json(items);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });


//   app.post('/new-getItemsByPurchaseId', async (req, res) => {
//     const { purchaseId } = req.body;
//     console.log(req.body);
//     console.log(purchaseId);

//     try {
//       if (!purchaseId) {
//         return res.status(400).json({ error: 'purchaseId is required' });
//       }

//       const items = await inventory.findAll({
//         where: { purchaseId }
//       });

//       if (items.length === 0) {
//         return res.status(404).json({ message: 'No items found for the given purchaseId' });
//       }

//       const groupedItems = _.chain(items)
//         .groupBy('challanNumber')
//         .map((value, key) => ({
//           challanId: key,
//           numberOfItems: value.length,
//           challanNumber: value[0].challanNumber,
//           warrantyStartDate: value[0].warrantyStartDate ? value[0].warrantyStartDate.toISOString().split('T')[0] : null,
//           items: value
//         }))
//         .value();

//       res.status(200).json({ items, groupedItems });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

//   // API route to assign a testing manager for multiple entries
//   app.post('/update-testing-data', async (req, res) => {
//     try {
//       console.log(req.body);
//       const { items, employeeId } = req.body;
//       const empInfo = await Employees.findOne({ where: { employeeId }, attributes: ['firstName', 'middleName', 'lastName'] });
//       // console.log(empInfo);
//       const engineerName = `${empInfo.firstName} ${empInfo.middleName} ${empInfo.lastName}`
//       // console.log(engineerName);

//       // Loop through each item and update the asset
//       const updatePromises = items.map(async (item) => {
//         console.log("item::::::", item);
//         const { categoryName, productName, serialNumber, testResult, remark: faultyRemark } = item;

//         try {
//           // Find the asset
//           const asset = await inventory.findOne({
//             where: {
//               categoryName,
//               productName,
//               serialNumber
//             }
//           });

//           if (asset) {
//             // Determine the new status based on the test result
//             const newStatus = testResult === 'FAIL' ? 'REJECTED' : 'IN STOCK';

//             // Update the asset
//             await inventory.update(
//               {
//                 engineerName,
//                 testingResult: testResult,
//                 status: newStatus,
//                 faultyRemark
//               },
//               {
//                 where: {
//                   categoryName,
//                   productName,
//                   serialNumber
//                 }
//               }
//             );
//           } else {
//             console.warn(`Asset not found for item: ${JSON.stringify(item)}`);
//           }
//         } catch (error) {
//           console.error(`Error updating asset for item: ${JSON.stringify(item)}`, error);
//         }
//       });

//       // Wait for all updates to complete
//       await Promise.all(updatePromises);

//       res.json({ message: 'Testing data updated for all items' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'An error occurred', error });
//     }
//   });

//   app.post('/delivery-product-list', async (req, res) => {
//     try {
//       const { category } = req.body;
//       let whereClause = { status: 'IN STOCK' };

//       if (category) {
//         whereClause.categoryName = category;
//       }

//       const inventoryItems = await inventory.findAll({
//         where: whereClause,
//         attributes: ['serialNumber', 'productName', 'status', 'categoryName', 'inventoryStoreName', 'hsnNumber']
//       });

//       res.status(200).json({ "productData": inventoryItems });
//     } catch (error) {
//       console.error('Error fetching inventory items:', error);
//       res.status(500).json({ error: 'An error occurred while fetching inventory items' });
//     }
//   });

//   app.post('/delivery-product-list-s2', async (req, res) => {
//     try {
//       const { clientName: client } = req.body;
//       let whereClause = { status: 'SENT TO CUSTOMER WAREHOUSE' };

//       if (client) {
//         whereClause.client = client;
//       }

//       const inventoryItems = await inventory.findAll({
//         where: whereClause,
//         attributes: ['serialNumber', 'productName', 'status', 'categoryName', 'client', 'clientWarehouse']
//       });

//       res.status(200).json({ "productData": inventoryItems });
//     } catch (error) {
//       console.error('Error fetching inventory items:', error);
//       res.status(500).json({ error: 'An error occurred while fetching inventory items' });
//     }
//   });

//   app.post('/update-delivery-data-s1', async (req, res) => {
//     console.log(req.body);
//     const { deliveryDetails } = req.body;
//     const { selectedClient: client } = req.body;
//     const { selectedWarehouse: clientWarehouse } = req.body;
//     const status = "SENT TO CUSTOMER WAREHOUSE"
//     const { items } = deliveryDetails;

//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ error: 'Invalid product data' });
//     }

//     try {
//       const deliveryDate = new Date();

//       for (const item of items) {
//         const { serialNumbers, productName } = item;
//         const serialNumber = serialNumbers[0];

//         if (!serialNumber || !productName) {
//           return res.status(400).json({ error: 'Invalid product data format' });
//         }

//         const updated = await inventory.update(
//           { client, clientWarehouse, deliveryDate, status },
//           {
//             where: {
//               serialNumber,
//               productName
//             }
//           }
//         );
//       }

//       res.status(200).json({ "message": "Data Delivered Successfully" });

//     } catch (error) {
//       console.error('Error updating inventory:', error);
//       res.status(500).json({ error: 'An error occurred while updating inventory items' });
//     }
//   });

//   app.post('/update-delivery-data-s2', async (req, res) => {
//     console.log(req.body);
//     const { deliveryDetails } = req.body;
//     const status = "DELIVERED TO SITE";
//     const { products } = deliveryDetails;
//     const { site } = deliveryDetails;
//     const { siteName } = site;
//     const deliveryDate = new Date();

//     if (!products || !Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({ error: 'Invalid product data' });
//     }

//     try {

//       for (const product of products) {
//         const { serialNumber, productName } = product;

//         if (!serialNumber || !productName) {
//           return res.status(400).json({ error: 'Invalid product data format' });
//         }

//         const updated = await inventory.update(
//           { siteName, status, deliveryDate },
//           {
//             where: {
//               serialNumber,
//               productName
//             }
//           }
//         );
//       }

//       res.status(200).json({ "message": "Data Updated Successfully" });

//     } catch (error) {
//       console.error('Error updating inventory:', error);
//       res.status(500).json({ error: 'An error occurred while updating inventory items' });
//     }
//   });

//   // Fetch assets with specific fields where status is RECEIVED
//   app.post('/quality-assurance-dashboard', async (req, res) => {
//     try {
//       const assets = await inventory.findAll({
//         attributes: ['categoryName', 'oemName', 'productName', 'serialNumber', 'challanNumber', 'status'],
//         where: {
//           status: 'RECEIVED'
//         }
//       });

//       res.status(200).json(assets);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching assets', error: error.message });
//     }
//   });

//   app.post('/scrap-managemet-dashboard', async (req, res) => {
//     try {
//       const assets = await inventory.findAll({
//         attributes: ['categoryName', 'oemName', 'productName', 'serialNumber', 'challanNumber', 'status'],
//         where: {
//           status: 'SCRAP'
//         }
//       });

//       res.status(200).json(assets);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching assets', error: error.message });
//     }
//   });

//   app.post('/grid-view-dashboard', async (req, res) => {
//     try {
//       const assets = await inventory.findAll({
//         attributes: ['categoryName', 'oemName', 'productName', 'siteName', 'serialNumber', 'status', 'warrantyStartDate', 'warrantyEndDate', 'deliveryDate', 'client', 'clientWarehouse', 'engineerName', 'faultyRemark'],
//         where: {
//           status: {
//             [Sequelize.Op.in]: ['RECEIVED', 'IN USE', 'FAULTY', 'SCRAP', 'IN STOCK', 'REJECTED', 'DELIVERED', 'RETURN TO OEM', 'RETURN TO SITE', 'SENT TO CUSTOMER WAREHOUSE', 'DELIVERED TO SITE']  // Example values
//           }
//         }


//       });

//       // Process the dates to remove the time part
//       const processedAssets = assets.map(asset => {
//         const warrantyStartDate = asset.warrantyStartDate ? asset.warrantyStartDate.toISOString().split('T')[0] : null;
//         const warrantyEndDate = asset.warrantyEndDate ? asset.warrantyEndDate.toISOString().split('T')[0] : null;
//         const deliveryDate = asset.deliveryDate ? asset.deliveryDate.toISOString().split('T')[0] : null;

//         return {
//           ...asset.dataValues,
//           warrantyStartDate,
//           warrantyEndDate,
//           deliveryDate
//         };
//       });

//       res.status(200).json(processedAssets);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching assets', error: error.message });
//     }
//   });

//   app.post('/faulty-asset-action', async (req, res) => {
//     console.log("req.body", req.body);
//     const { assetsData } = req.body;

//     if (!Array.isArray(assetsData) || assetsData.length === 0) {
//       return res.status(400).json({ message: 'Invalid or empty data array' });
//     }

//     try {
//       for (const assetData of assetsData) {
//         const { productName, serialNumber, action } = assetData;
//         console.log("productName", productName);
//         console.log("serialNumber", serialNumber);
//         console.log("action", action);

//         // Determine the new status based on the action
//         let newStatus;
//         switch (action) {
//           case 'Mark as Scrap':
//             newStatus = 'SCRAP';
//             break;
//           case 'Sent Back to the OEM':
//             newStatus = 'RETURN TO OEM';
//             break;
//           case 'Sent Back to the Site':
//             newStatus = 'RETURN TO SITE';
//             break;
//           case 'Delivered':
//             newStatus = "DELIVERED TO SITE";
//             break;
//           case 'Return under inspection':
//             newStatus = "RETURN UNDER INSPECTION";  
//             break;
//           default:
//             // Skip invalid actions
//             continue;
//         }
//         console.log("new Status", newStatus);

//         // Update the asset status
//         await inventory.update(
//           { status: newStatus },
//           {
//             where: {
//               productName,
//               serialNumber
//             }
//           }
//         );
//       }

//       res.status(200).json({ message: 'Assets status updated successfully' });
//     } catch (error) {
//       res.status(500).json({ message: 'Error updating asset statuss', error: error.message });
//     }
//   });

//   app.post('/faulty-asset-dashboard', async (req, res) => {
//     try {
//       // console.log("HIT.......................");
//       const assets = await inventory.findAll({
//         attributes: ['serialNumber', 'productName', 'warrantyStartDate', 'warrantyEndDate', 'siteName', 'status', 'oemName', 'hsnNumber', 'client', 'clientWarehouse'],
//         where: {
//           status: ['IN STOCK', 'DELIVERED TO SITE', 'RETURN TO OEM', 'RETURN TO SITE', 'SCRAP', 'SENT TO CUSTOMER WAREHOUSE', 'REJECTED','RETURN UNDER INSPECTION']
//         }
//       });
//       console.log(assets);

//       const formattedAssets = assets.map(asset => ({
//         serialNumber: asset.serialNumber,
//         productName: asset.productName,
//         warrantyStartDate: asset.warrantyStartDate ? asset.warrantyStartDate.toISOString().split('T')[0] : null,
//         warrantyEndDate: asset.warrantyEndDate ? asset.warrantyEndDate.toISOString().split('T')[0] : null,
//         siteName: asset.siteName,
//         status: asset.status,
//         hsnNumber: asset.hsnNumber,
//         client: asset.client,
//         clientWarehouse: asset.clientWarehouse
//       }));

//       res.json(formattedAssets);
//     } catch (error) {
//       res.status(500).send({
//         message: error.message || "Some error occurred while retrieving assets."
//       });
//     }
//   });

//   app.post('/scrap-management-action', async (req, res) => {
//     try {
//       const { serialNumber, oemName, productName, status, categoryName, challanNumber } = req.body;
//       const asset = await inventory.findOne({
//         where: { serialNumber, productName, oemName, categoryName, challanNumber }
//       });

//       if (!asset) {
//         return res.status(404).json({ error: `Asset with serial number ${serialNumber} and product name ${productName} not found` });
//       }

//       if (status === 'In Stock') {
//         await inventory.update(
//           { status: 'IN STOCK' },
//           { where: { serialNumber, productName, oemName, categoryName, challanNumber } }
//         );
//       }


//       res.status(200).json({ message: 'Assets updated successfully' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

//   // API to store multiple AssetClient entries
//   app.post('/asset-client', async (req, res) => {
//     try {
//       const { data } = req.body;
//       console.log(req.body);

//       // Function to generate new clientId
//       const getNewClientId = async () => {
//         const maxClient = await client.max('clientId');
//         return maxClient ? maxClient + 1 : 1000;
//       };

//       const newClients = [];

//       for (const c of data) {
//         const { client: name } = c;
//         if (!name) {
//           return res.status(400).json({ "Message": "Client Name must not be empty" })
//         }

//         // Check if clientId already exists
//         const existingClient = await client.findOne({ where: { name } });
//         if (existingClient) {
//           return res.status(400).json({ message: `Client Name ${name} already exists` });
//         }

//         // Get new clientId if not provided
//         const newClientId = await getNewClientId();

//         // Create new client
//         const newClient = await client.create({
//           clientId: newClientId,
//           name
//         });

//         newClients.push(newClient);
//       }

//       res.status(201).json(newClients);
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating clients', error });
//     }
//   });


//   // API to store multiple AssetWarehouse entries
//   app.post('/asset-warehouse', async (req, res) => {
//     try {
//       const { data } = req.body;
//       console.log(req.body);

//       // Function to generate new id
//       const getNewId = async () => {
//         const maxId = await warehouse.max('warehouseId');
//         return maxId ? maxId + 1 : 1000;
//       };

//       const newWarehouses = [];

//       for (const w of data) {
//         const { warehouse: name, client: clientName } = w;
//         if (!name) {
//           return res.status(400).json({ "message": "Warehouse Name must not be empty" })
//         }

//         // Check if name already exists
//         const existingWarehouse = await warehouse.findOne({ where: { name } });
//         if (existingWarehouse) {
//           return res.status(400).json({ message: `Warehouse name ${name} already exists` });
//         }
//         if (!name) {
//           return res.status(400).json({ message: `Warehouse name should not be Empty` });
//         }

//         // Get new id
//         const newId = await getNewId();

//         // Create new warehouse
//         const newWarehouse = await warehouse.create({
//           warehouseId: newId,
//           name,
//           clientName
//         });

//         newWarehouses.push(newWarehouse);
//       }

//       res.status(201).json(newWarehouses);
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating warehouses', error });
//     }
//   });

//   // API to retrieve all AssetClient entries
//   app.post('/asset-client-dropdown', async (req, res) => {
//     try {
//       const assetClients = await client.findAll({
//         attributes: ['clientId', 'name']
//       });

//       res.status(200).send(assetClients);
//     } catch (error) {
//       res.status(500).send(error);
//     }
//   });

//   // API to retrieve all AssetWarehouse entries
//   app.post('/asset-warehouse-dropdown', async (req, res) => {
//     try {
//       console.log(req.body);
//       const { clientName } = req.body;
//       const assetWarehouses = await warehouse.findAll({ where: { clientName } });
//       res.status(200).send(assetWarehouses);
//     } catch (error) {
//       res.status(500).send(error);
//     }
//   });
//   app.post('/asset-warehouse-dropdown-all', async (req, res) => {
//     try {
//       console.log(req.body);
//       const { clientName } = req.body;
//       const assetWarehouses = await warehouse.findAll({ attributes: ['warehouseId', 'name', 'clientName'] });
//       res.status(200).send(assetWarehouses);
//     } catch (error) {
//       res.status(500).send(error);
//     }
//   });
//    app.post('/getChallanNumByPurchaseId', async (req, res) => {
//     try {
//       const { purchaseId } = req.body; // Destructure purchaseId from req.body
//       if (!purchaseId) {
//         return res.status(400).json({ message: 'Purchase ID is required' });
//       }

//       // Find all records matching the purchaseId and get distinct challanNumbers
//       const data = await inventory.findAll({
//         where: { purchaseId },
//         attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('challanNumber')), 'challanNumber']]
//       });

//       // Extract the challanNumbers from the data
//       const distinctChallanNumbers = data.map(item => item.challanNumber);

//       // Return the distinct challanNumbers in the response
//       res.status(200).json(data);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

//   app.post('/old-update-asset-data', async (req, res) => {
//     try {
//       const { option, newName, Id } = req.body;

//       if (!option || !newName) {
//         return res.status(400).json({ message: 'Invalid request data' });
//       }

//       switch (option) {
//         case 'Category':
//           const data = await category.findOne({ where: { categoryId: Id } });
//           const oldName = data.name;
//           const updateCategoryRow = await category.update(
//             { name: newName },
//             { where: { categoryId: Id } }
//           );

//           if (updateCategoryRow === 0) {
//             console.log('No user found with the given ID.');
//           } else {
//             const updateInventoryRows = await inventory.update(
//               { categoryName: newName },
//               { where: { categoryName: oldName } }
//             );
//             if (updateInventoryRows === 0) {
//               console.log('Inventory rows Category Name is not updated or there is no row having that category name')
//             }
//             else {
//               console.log('Inventory rows Category Name is updated Successfully');
//             }
//           }
//           break;
//         case 'Warehouse':
//           await stores.destroy({ where: { storeName: names } });
//           break;
//         case 'Customer Warehouse':
//           await warehouse.destroy({ where: { name: names } });
//           break;
//         case 'Customer':
//           await client.destroy({ where: { name: names } });
//           break;
//         case 'OEM':
//           await oem.destroy({ where: { oemName: names } });
//           break;
//         case 'Installation Site':
//           await site.destroy({ where: { siteName: names } });
//           break;
//         default:
//           return res.status(400).json({ message: 'Invalid option' });
//       }

//       res.status(200).json({ message: 'Rows Updated successfully' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });

//   app.post('/update-asset-data', async (req, res) => {
//     try {
//       console.log("PAYLOAD:", req.body);
//       const { option, item } = req.body;
//       // const { option, newName, Id, address } = req.body;
//       // const{name:newName} = item;
//       // const{id:newName} = item;
//       // const{name:newName} = item;
//       if (!option || !item) {
//         return res.status(400).json({ message: 'Invalid request data' });
//       }
//       switch (option) {
//         case 'Category':
//           const catId = item.categoryId;
//           const newCatName = item.name;
//           const newhsn = item.hsnNumber;
//           const categoryData = await category.findOne({ where: { categoryId: catId } });
//           if (!categoryData) {
//             return res.status(404).json({ message: 'Category not found' });
//           }
//           const oldCategoryName = categoryData.name;
//           const oldCategoryHsn = categoryData.hsnNumber;
//           const updateCategoryRow = await category.update(
//             { name: newCatName, hsnNumber: newhsn },
//             { where: { categoryId: catId } }
//           );
//           if (updateCategoryRow[0] === 0) {
//             console.log('No category found with the given ID.');
//           } else {
//             const updateInventoryRows = await inventory.update(
//               { categoryName: newCatName, hsnNumber: newhsn },
//               { where: { categoryName: oldCategoryName, hsnNumber: oldCategoryHsn } }
//             );
//             if (updateInventoryRows[0] === 0) {
//               console.log('Inventory rows Category Name is not updated or there is no row having that category name');
//             } else {
//               console.log('Inventory rows Category Name is updated Successfully');
//             }
//           }
//           break;
//         case 'Warehouse'://Store
//         const storeID = item.storeId;
//         const newStoreName = item.storeName;
//         const newStoreAddress = item.address;
//           const warehouseData = await stores.findOne({ where: { storeId: storeID } });
//           if (!warehouseData) {
//             return res.status(404).json({ message: 'Warehouse not found' });
//           }
//           const oldWarehouseName = warehouseData.storeName;
//           const oldWarehouseAddress = warehouseData.address;
//           const updateCondition = { storeName: newStoreName }
//           if (newStoreAddress) {
//             updateCondition['address'] = newStoreAddress;
//           }
//           const updateWarehouseRow = await stores.update(
//             updateCondition,
//             { where: { storeId: storeID } }
//           );
//           if (updateWarehouseRow[0] === 0) {
//             console.log('No warehouse found with the given ID.');
//           } else {
//             const updateCondition = { inventoryStoreName: newStoreName }
//             if (newStoreAddress) {
//               updateCondition['storeLocation'] = newStoreAddress;
//             }
//             const updateInventoryRows = await inventory.update(
//               updateCondition,
//               { where: { inventoryStoreName: oldWarehouseName, storeLocation: oldWarehouseAddress } }
//             );
//             if (updateInventoryRows[0] === 0) {
//               console.log('Inventory rows Store Name is not updated or there is no row having that store name');
//             } else {
//               console.log('Inventory rows Store Name is updated Successfully');
//             }
//           }
//           break;
//         case 'Customer Warehouse'://Warehouse
//         const warehouseID = item.warehouseId;
//         const newWarehouseName = item.name;
//           const customerWarehouseData = await warehouse.findOne({ where: { warehouseId: warehouseID } });
//           if (!customerWarehouseData) {
//             return res.status(404).json({ message: 'Customer Warehouse not found' });
//           }
//           const oldCustomerWarehouseName = customerWarehouseData.name;
//           const updateCustomerWarehouseRow = await warehouse.update(
//             { name: newWarehouseName },
//             { where: { warehouseId: warehouseID } }
//           );
//           if (updateCustomerWarehouseRow[0] === 0) {
//             console.log('No customer warehouse found with the given ID.');
//           } else {
//             const updateInventoryRows = await inventory.update(
//               { clientWarehouse: newWarehouseName },
//               { where: { clientWarehouse: oldCustomerWarehouseName } }
//             );
//             if (updateInventoryRows[0] === 0) {
//               console.log('Inventory rows Warehouse Name is not updated or there is no row having that warehouse name');
//             } else {
//               console.log('Inventory rows Warehouse Name is updated Successfully');
//             }
//           }
//           break;
//         case 'Customer'://Client
//         const clientID = item.clientId;
//         const clientNewName = item.name;
//           const customerData = await client.findOne({ where: { clientId: clientID } });
//           if (!customerData) {
//             return res.status(404).json({ message: 'Customer not found' });
//           }
//           const oldCustomerName = customerData.name;
//           const updateCustomerRow = await client.update(
//             { name: clientNewName },
//             { where: { clientId: clientID } }
//           );
//           const updateCustomerWarehouserow = await warehouse.update(
//             { clientName: clientNewName },
//             { where: { clientName: oldCustomerName } }
//           );
//           if (updateCustomerRow[0] === 0) {
//             console.log('No customer found with the given ID.');
//           } else {
//             const updateInventoryRows = await inventory.update(
//               { client: clientNewName },
//               { where: { client: oldCustomerName } }
//             );
//             if (updateInventoryRows[0] === 0) {
//               console.log('Inventory rows Client Name is not updated or there is no row having that client name');
//             } else {
//               console.log('Inventory rows Client Name is updated Successfully');
//             }
//           }
//           break;
//         case 'OEM'://OEM
//           const oemId = item.oemId;
//           const oemAddress = item.address
//           const oemNewName = item.oemName
//           const oemPanNo=item.panNo
//           const oemGstNo=item.gstNo

//           const oemData = await oem.findOne({ where: { oemId: oemId } });
//           if (!oemData) {
//             return res.status(404).json({ message: 'OEM not found' });
//           }
//           const oldOemName = oemData.oemName;
//           const updateOemRow = await oem.update(
//             { oemName: oemNewName,address:oemAddress, panNo: oemPanNo, gstNo: oemGstNo },
//             { where: { oemId: oemId } }
//           );
//           if (updateOemRow[0] === 0) {
//             console.log('No OEM found with the given ID.');
//           } else {
//             const updateInventoryRows = await inventory.update(
//               { oemName: oemNewName },
//               { where: { oemName: oldOemName } }
//             );
//             const updatePurchaseTable = await purchase.update(
//               {oemName:oemNewName},
//               {where:{oemName: oldOemName}}
//             )
//             if (updateInventoryRows[0] === 0) {
//               console.log('Inventory rows OEM Name is not updated or there is no row having that OEM name');
//             } else {
//               console.log('Inventory rows OEM Name is updated Successfully');
//             }
//             if (updatePurchaseTable[0] === 0) {
//               console.log('Purchase rows OEM Name is not updated or there is no row having that OEM name');
//             } else {
//               console.log('Purchase rows OEM Name is updated Successfully');
//             }
//           }
//           break;
//         case 'Installation Site'://Site
//           const siteID = item.siteId;
//           const siteAddress = item.address;
//           const newSiteName = item.siteName;
//           const siteData = await site.findOne({ where: { siteId: siteID } });
//           if (!siteData) {
//             return res.status(404).json({ message: 'Installation Site not found' });
//           }
//           const oldSiteName = siteData.siteName;
//           const updateSiteRow = await site.update(
//             { siteName: newSiteName ,address:siteAddress},
//             { where: { siteId: siteID } }
//           );
//           if (updateSiteRow[0] === 0) {
//             console.log('No installation site found with the given ID.');
//           } else {
//             const updateInventoryRows = await inventory.update(
//               { siteName: newSiteName },
//               { where: { siteName: oldSiteName } }
//             );
//             if (updateInventoryRows[0] === 0) {
//               console.log('Inventory rows Site Name is not updated or there is no row having that site name');
//             } else {
//               console.log('Inventory rows Site Name is updated Successfully');
//             }
//           }
//           break;
//         default:
//           return res.status(400).json({ message: 'Invalid option' });
//       }
//       res.status(200).json({ message: 'Rows updated successfully' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });


//   app.post('/purchaseId-dropdown', async (req, res) => {
//     try {
//       // Fetch distinct purchaseId and the corresponding oemName from inventory table
//       const oemAndPurchaseId = await inventory.findAll({
//         attributes: [
//           [Sequelize.fn('DISTINCT', Sequelize.col('purchaseId')), 'purchaseId'],
//           'oemName'
//         ],
//         raw: true
//       });

//       res.status(200).json(oemAndPurchaseId);
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: 'Error fetching distinct purchase IDs and OEM names', error });
//     }
//   });

  
//   app.use("/", apiRoutes);
// }