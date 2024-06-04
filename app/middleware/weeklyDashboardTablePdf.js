var PdfTable = require('voilab-pdf-table'),
    PdfDocument = require('pdfkit'),
    Sequelize = require('Sequlize')

module.exports = {
    create: function () {
        // create a PDF from PDFKit, and a table from PDFTable
        var pdf = new PdfDocument({
                autoFirstPage: false
            }),
            table = new PdfTable(pdf, {
                bottomMargin: 30
            });
            tableabc = new PdfTable(pdf, {
                bottomMargin: 30
            });

        table
            // add some plugins (here, a 'fit-to-width' for a column)
            .addPlugin(new (require('voilab-pdf-table/plugins/fitcolumn'))({
                column: 'description'
            }))
            // set defaults to your columns
            .setColumnsDefaults({
                headerBorder: 'B',
                align: 'right'
            })
            // add table columns
            .addColumns([
                {
                    id: 'description',
                    header: 'Product',
                    align: 'left'
                },
                {
                    id: 'quantity',
                    header: 'Quantity',
                    align: 'left',
                    width: 50
                },
                {
                    id: 'price',
                    header: 'Price',
                    width: 40,
                },
                {
                    id: 'total',
                    header: 'Total',
                    width: 70,
                    renderer: function (tb, data) {
                        return 'CHF ' + data.total;
                    }
                }
            ])
            // add events (here, we draw headers on each new page)
            .onPageAdded(function (tb) {
                tb.addHeader();
            });
        tableabc
            // add some plugins (here, a 'fit-to-width' for a column)
            .addPlugin(new (require('voilab-pdf-table/plugins/fitcolumn'))({
                column: 'descriptionss'
            }))
            // set defaults to your columns
            .setColumnsDefaults({
                headerBorder: 'B',
                align: 'right'
            })
            // add table columns
            .addColumns([
                {
                    id: 'descriptionss',
                    header: 'Product',
                    align: 'left'
                },
                {
                    id: 'quantityss',
                    header: 'Quantity',
                    align: 'left',
                    width: 50
                },
                {
                    id: 'pricess',
                    header: 'Price',
                    width: 40,
                },
                {
                    id: 'totalss',
                    header: 'Total',
                    width: 70,
                }
            ])
            // add events (here, we draw headers on each new page)
            .onPageAdded(function (tb) {
                tb.addHeader();
            });

        // if no page already exists in your PDF, do not forget to add one
        pdf.addPage();

        // draw content, by passing data to the addBody method
        table.addBody([
            {description: 'Product 1', quantity: 1, price: 20.10, total: 20.10},
            {description: 'Product 2', quantity: 4, price: 4.00, total: 16.00},
            {description: 'Product 3', quantity: 2, price: 17.85, total: 35.70}
        ]);
        
        tableabc.addBody([
            {descriptionss: 'Product 1', quantityss: 1, pricess: 20.10, totalss: 20.10},
            {descriptionss: 'Product 2', quantityss: 4, pricess: 4.00, totalss: 16.00},
            {descriptionss: 'Product 3', quantityss: 2, pricess: 17.85, totalss: 35.70}
        ]);

        return pdf;
    }
};