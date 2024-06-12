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
const { log } = require("console");
const category = db.AssetCategory
const challan = db.AssetChallan
const engineer = db.AssetEngineer
const inventory = db.AssetInventory
const item = db.AssetItem
const model = db.AssetModel
const store = db.AssetStore
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
                name
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

  // API to create new stores
  app.post('/asset-stores', async (req, res) => {
    try {
      console.log(req.body);
      const getNewStoreId = async () => {
        const maxStoreId = await store.max('storeId');
        return maxStoreId ? maxStoreId + 1 : 1000;
      };
  
      const { data } = req.body;
      const newStores = [];
  
      for (const d of data) {
        const { store: storeName } = d;
        console.log(storeName);
  
        // Check if storeName already exists
        const existingStore = await store.findOne({ where: { storeName } });
        if (existingStore) {
          return res.status(400).json({ message: `Store name '${storeName}' already exists` });
        }
  
        // Get new storeId
        const newStoreId = await getNewStoreId();
  
        // Create new store object
        newStores.push({
          storeId: newStoreId,
          storeName
        });
      }
  
      // Bulk create new stores
      await store.bulkCreate(newStores);
  
      res.status(201).json({ message: 'Stores created successfully', stores: newStores });
    } catch (error) {
      res.status(500).json({ message: 'Error creating stores', error });
    }
  });
  

  // API to get store IDs and names
  app.get('/stores-dropdown', async (req, res) => {
    try {
      const stores = await AssetStore.findAll({
        attributes: ['storeId', 'storeName']
      });
      res.status(200).send(stores);
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
      console.log("req.body",req.body);
      const { data } = req.body; 
      console.log(data);
      // Function to generate new engineerId
      const getNewEngineerId = async () => {
        const maxEngineer = await engineer.max('engineerId');
        return maxEngineer ? maxEngineer + 1 : 1000;
      };
  
      const newEngineers = [];
  
      for (const engData of data) {
        console.log("engData",engData);
        const name = engData.engineer; // Extract the name value
  
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
            const { oem:oemName } = o;

            // Check if email already exists
            const existingOem = await oem.findOne({ where: { oemName } });
            if (existingOem) {
                return res.status(400).json({ message: `OEM Name ${oemName} already exists` });
            }

            // Get new oemId
            const newOemId = await getNewOemId();

            // Create new OEM
            const newOem = await oem.create({
                oemId: newOemId,
                oemName
            });

        }

        res.status(201).json({"message":"Successfully Created"});
    } catch (error) {
        res.status(500).json({ message: 'Error creating OEMs', error });
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
      const {data} = req.body; 
      console.log(req.body);

      // Function to generate new siteId
      const getNewSiteId = async () => {
        const maxSite = await site.max('siteId');
        return maxSite ? maxSite + 1 : 1000;
      };

      const newSites = [];

      for (const s of data) {
        const { site: siteName} = s;

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
          siteName
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

      res.status(201).json({ message: "Entries Created Successfully"});
    } catch (error) {
      res.status(500).json({ message: 'Error creating entries', error });
    }
  });//important

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

  // API route to assign a testing manager for multiple entries
  app.post('/update-testing-data', async (req, res) => {
    try {
        console.log(req.body);
        const { items, engineerName } = req.body;

        // Loop through each item and update the asset
        const updatePromises = items.map(async (item) => {
            console.log("item::::::", item);
            const {categoryName,productName, serialNumber, testResult } = item;

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
                            status: newStatus
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
        attributes: ['serialNumber', 'productName', 'status', 'categoryName']
      });

      res.status(200).json({ "productData": inventoryItems });
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      res.status(500).json({ error: 'An error occurred while fetching inventory items' });
    }
  });

  app.post('/update-delivery-data', async (req, res) => {
    const { products, substation } = req.body.deliveryDetails;
    console.log("products", products);
    console.log("substation", substation);
    const siteName = substation.siteName;
    console.log("siteName", siteName);
    const status = "DELIVERED"

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Invalid product data' });
    }

    if (!siteName) {
      return res.status(400).json({ error: 'Site name is required' });
    }

    try {
      const deliveryDate = new Date();

      for (const product of products) {
        const { serialNumber, productName } = product;

        if (!serialNumber || !productName) {
          return res.status(400).json({ error: 'Invalid product data format' });
        }

        const updated = await inventory.update(
          { siteName, deliveryDate, status },
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
          attributes: ['categoryName', 'oemName', 'productName', 'siteName','serialNumber','status','warrantyStartDate','warrantyEndDate','deliveryDate'],
          where: {
              status: 'DELIVERED'
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

app.post('/faulty-asset-action', async (req, res) => {
  console.log("req.body",req.body);
  const {assetsData} = req.body;

  if (!Array.isArray(assetsData) || assetsData.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty data array' });
  }

  try {
      for (const assetData of assetsData) {
          const {productName, siteName, serialNumber, action } = assetData;

          // Determine the new status based on the action
          let newStatus;
          switch(action) {
              case 'Mark as Scrap':
                  newStatus = 'SCRAP';
                  break;
              case 'Sent Back to OEM':
                  newStatus = 'RETURN TO OEM';
                  break;
              case 'Sent Back to the Site':
                  newStatus = 'RETURN TO SITE';
                  break;
              case 'Delivered':
                newStatus = "DELIVERED"   
              default:
                  // Skip invalid actions
                  continue;
          }

          // Update the asset status using Sequelize's update method
          await inventory.update(
              { status: newStatus },
              {
                  where: {
                      productName,
                      siteName,
                      serialNumber
                  }
              }
          );
      }

      res.status(200).json({ message: 'Assets status updated successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error updating asset statuses', error: error.message });
  }
});

app.post('/faulty-asset-dashboard', async (req, res) => {
  try {
    const assets = await inventory.findAll({
        attributes: ['serialNumber', 'productName', 'warrantyStartDate', 'warrantyEndDate', 'siteName', 'status'],
        where: {
            status: ['DELIVERED', 'RETURN TO OEM', 'RETURN TO SITE', 'SCRAP']
        }
    });

    const formattedAssets = assets.map(asset => ({
        serialNumber: asset.serialNumber,
        productName: asset.productName,
        warrantyStartDate: asset.warrantyStartDate ? asset.warrantyStartDate.toISOString().split('T')[0] : null,
        warrantyEndDate: asset.warrantyEndDate ? asset.warrantyEndDate.toISOString().split('T')[0] : null,
        siteName: asset.siteName,
        status: asset.status
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
  const {serialNumber,oemName,productName,status,categoryName,challanNumber} = req.body;
          const asset = await inventory.findOne({
              where: { serialNumber, productName,oemName,categoryName,challanNumber }
          });

          if (!asset) {
              return res.status(404).json({ error: `Asset with serial number ${serialNumber} and product name ${productName} not found` });
          }

          if (status === 'In Stock') {
              await inventory.update(
                  { status: 'IN STOCK' },
                  { where: { serialNumber, productName,oemName,categoryName,challanNumber } }
              );
          }
      

      res.status(200).json({ message: 'Assets updated successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});





  app.use("/", apiRoutes);
}