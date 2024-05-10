/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
/*****************************************************************************************************************************************************************************************
**************************
*
*${Today RAFF Assessment}:${Customer Statement}
*
******************************************************************************************************************************************************************************************
**************************
 *
 * Author : Jobin and Jismi
 *
 * Date Created : 10-May-2024
 *
 * Created by :Sanjay Kushwaha, Jobin and Jismi IT Services.
 *
 * Description : Create Customer Statement PDF
 *
 *
*****************************************************************************************************************************************************************************************
******************************/
define(['N/file', 'N/record', 'N/render', 'N/email', 'N/error','N/search'], 
function(file, record, render, email, error,search) {

    function createCustomerStatements(requestBody) {
        // Extract data from the request body
        var folderName = requestBody['folder name'];
        var emailAddress = requestBody['email address'];
        var startDate = new Date(requestBody['startDate']);

          // Validate request body keys
          if (!folderName || !emailAddress || !startDate) {
            throw error.create({
                name: 'INVALID_REQUEST',
                message: 'PLease Provide the Details Correctly'
            });
        }

        // Check if folder with the same name already exists
        var folderSearch = file.create({
            name: folderName,
            fileType: file.Type.FOLDER
        })
        log.debug("folderSearch",folderSearch);
        var newFolder=folderSearch.save();
        
        log.debug("newFolder",newFolder);

        var folderId = newFolder;

        // Retrieve all customers in the NetSuite account
        var customerSearch = record.load({
            type: record.Type.CUSTOMER,
            id: null
        });

        // Prepare and store customer statement PDFs in the folder
        customerSearch.each(function(customer) {
            var customerId = customer.getValue({ 
                fieldId: 'internalid' 
            });
            var customerName = customer.getValue({
                fieldId: 'entityid' 
            });

            var pdfContent = renderCustomerStatementPDF(customerId, 
                
            );

            var fileName = "Customer_Statement "
            var pdfFile = file.create({
                name: fileName + '.pdf',
                fileType: file.Type.PDF,
                contents: pdfContent
            }).folder = folderId;
            pdfFile.save();
        });

        //Send Email 
        email.send({
            author: -5, 
            recipients: emailAddress,
            subject: 'Customer Statement',
            body: 'Please check the statement Added for Each Customer: ' + folderName
        });
    }

    function renderCustomerStatementPDF(customerId, startDate) {
    var renderer = render.create();
    
    // Set template content for rendering
    renderer.templateContent = '<html><body><h1>Customer Statement</h1><p>Customer ID: ' + customerId + '</p></body></html>';
    
    // Add dynamic data to the template
    renderer.addCustomDataSource({
        format: render.DataSource.OBJECT,
        alias: 'customerData',
        data: {
            customerId: customerId,
            startDate: startDate
        }
    });
    
    // Render the PDF content
    var pdfContent = renderer.renderAsPdf();
    
    return pdfContent;
    }
    function post(context) {
        try {
            if (!context.request) {
                throw error.create({
                    name: 'REQUEST_UNDEFINED',
                    message: 'Request object is undefined.'
                });
            }
    
            var requestBody = context.request.body;
            if (!requestBody) {
                throw error.create({
                    name: 'REQUEST_BODY_UNDEFINED',
                    message: 'Request body is undefined.'
                });
            }
    
            createCustomerStatements(requestBody);
    
            if (context.response) {
                context.response.write({
                    output: 'Customer statement PDFs generated successfully.'
                });
            } else {
                throw error.create({
                    name: 'RESPONSE_UNDEFINED',
                    message: 'Response object is undefined.'
                });
            }
        } catch (e) {
            if (context.response) {
                context.response.write({
                    output: e.message
                });
            } else {
                log.error('Error occurred without response object defined:', e);
            }
        }
    }
    

    return {
        post: post
    };
});