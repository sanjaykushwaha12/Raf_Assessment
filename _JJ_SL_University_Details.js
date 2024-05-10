/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
/*****************************************************************************************************************************************************************************************
**************************
*
*${Today RAFF Assessment}:${University Details}
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
 * Description : CCreate a Form to show the University Details
 *
 *
*****************************************************************************************************************************************************************************************
******************************/
define(['N/ui/serverWidget', 'N/http'], function (serverWidget, http) {

    function onRequest(context) {
        var request = context.request;
        var response = context.response;
        if (request.method === 'GET') {

            //Created form 
            var universityForm = serverWidget.createForm({
                title: 'University List'
            });

            //added Field Country
            var countryField = universityForm.addField({
                id: 'country',
                type: serverWidget.FieldType.SELECT,
                label: 'Country'
            });
            //Added option for the Country
            countryField.addSelectOption({
                value: '',
                text: '--Choose Country--'
            });
            countryField.addSelectOption({
                value: 'India',
                text: 'India'
            });
            countryField.addSelectOption({
                value: 'China',
                text: 'China'
            });
            countryField.addSelectOption({
                value: 'Japan',
                text: 'Japan'
            });
            countryField.isMandatory = true;
            //Added submit button
            universityForm.addSubmitButton({
                label: 'Submit'
            });

            //Added Sublist to show the Details
            var sublist = universityForm.addSublist({
                id: 'university_sublist',
                type: serverWidget.SublistType.LIST,
                label: 'University Details'
            });
            sublist.addField({
                id: 'country',
                type: serverWidget.FieldType.TEXT,
                label: 'Country'
            });
            sublist.addField({
                id: 'jj_name',
                type: serverWidget.FieldType.TEXT,
                label: 'Name'
            });
            sublist.addField({
                id: 'jj_state',
                type: serverWidget.FieldType.TEXT,
                label: 'State/Province'
            });
            sublist.addField({
                id: 'jj_webpage',
                type: serverWidget.FieldType.URL,
                label: 'WebSite'
            });

            response.writePage(universityForm);
        } else {
            //Getting country details
            var country = request.parameters.country;
            var url = 'http://universities.hipolabs.com/search?country=' + (country);
            var httpResponse = http.get({
                url: url
            });
            var universities = JSON.parse(httpResponse.body);
            log.debug("country",country);

            var universityForm = serverWidget.createForm({
                title: 'University List'
            });

            // Again creating the country field and set the selected value
            var countryField = universityForm.addField({
                id: 'country',
                type: serverWidget.FieldType.SELECT,
                label: 'Country'
            });
            countryField.addSelectOption({ 
                value: '', 
                text: '' 
            });
            countryField.addSelectOption({ 
                value: 'India', 
                text: 'India', 
                isSelected: country === 'India' 
            });
            countryField.addSelectOption({ 
                value: 'China', 
                text: 'China', 
                isSelected: country === 'China' 
            });
            countryField.addSelectOption({ 
               value: 'Japan', 
               text: 'Japan', 
               isSelected: country === 'Japan' 
            });
            countryField.isMandatory = true;

            universityForm.addSubmitButton({
                label: 'Submit'
            });

            // Again Created the sublist
            var sublist = universityForm.addSublist({
                id: 'university_sublist',
                type: serverWidget.SublistType.LIST,
                label: 'University Details'
            });
            sublist.addField({
                id: 'country',
                type: serverWidget.FieldType.TEXT,
                label: 'Country'
            });
            sublist.addField({
                id: 'jj_name',
                type: serverWidget.FieldType.TEXT,
                label: 'Name'
            });
            sublist.addField({
                id: 'jj_state',
                type: serverWidget.FieldType.TEXT,
                label: 'State/Province'
            });
            sublist.addField({
                id: 'jj_webpage',
                type: serverWidget.FieldType.URL,
                label: 'WebSite'
            });
            universities.forEach(function (university, index) {
    
                sublist.setSublistValue({
                    id: 'country',
                    line: index,
                    value: university.country || ''
                });
                sublist.setSublistValue({
                    id: 'jj_name',
                    line: index,
                    value: university.name || ''
                });
                sublist.setSublistValue({
                    id: 'jj_state',
                    line: index,
                    value: university['state-province']
                });

                sublist.setSublistValue({
                    id: 'jj_webpage',
                    line: index,
                    value: (university.web_pages && university.web_pages[0]) || ''
                });
            });
            response.writePage(universityForm);
        }
    }
    return {
        onRequest: onRequest
    };
});
