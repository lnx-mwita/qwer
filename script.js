window.$ = window.jQuery = require('./jquery.js');

const remote = require('@electron/remote');
const { dialog } = remote;

const pdf_gen = require('../index.js')
const template1 = require('./templates/temp1')
const template2 = require('./templates/temp2')

$('body').addClass('hidenote hidedate');

var templates ={
  temp1 : template1,
  temp2 : template2,
}

var items = 1



var invoice_data = {
  description : [],
  unit_price : [],
  quantity : [],
  subtotal : [],
  items : items


}

var template_data ={
  invoice_data :invoice_data,
  from : null,
  to:null,
  date:"",
  contact_info:"",
  adrress:"",
  company_name:"",
  payment_info:"",
  company_details:"",
  timeline: "",
  footnotes:"",
  date:"",
  total:null,
  delivery_note : true
}


async function getSavePath() {
  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save File',
    filters: [ { name: 'PDF file', extensions: [ 'pdf' ] } ]
  });  
  if(filePath){
    return filePath
  }
  else{
    false
  }
}




function init_date(){
  var now = new Date();
  var month = (now.getMonth() + 1);       
  var day = now.getDate();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  var today =  day +'.' + month + '.' + now.getFullYear().toString().substr(2,2);
  
  var intwoweeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  var month = (intwoweeks.getMonth() + 1);       
  var day = intwoweeks.getDate();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  
  var twoweeks =  day +'.' + month + '.' + intwoweeks.getFullYear().toString().substr(2,2);
  
  

  $('.datePicker').val(today);
  $('.twoweeks').val(twoweeks);
}

function calculate(){

  var total_price = 0


  $('.invoicelist-body tbody tr').each( function(){
    var row = $(this),
        unit_price   = row.find('.unit_price input').val(),
        amount = row.find('.amount input').val();
    
    var subtotal = unit_price * amount;
    
    
    
    total_price = total_price + subtotal;

    
    row.find('.subtotal').text( subtotal.toFixed(2) );  
  });

  $('#total_price').text(total_price.toFixed(2));
}




$('.invoicelist-body').on('keyup','input',function(){
  calculate();
});

var item_instance =[]
$('.invoicelist-body').on('keyup','table',function(){
  $('.invoicelist-body tbody tr').each( function(){
    var row = $(this),
        description = row.find('.item_description ').text(),
        unit_price   = row.find('.unit_price input').val(),
        quantity = row.find('.amount input').val();
        subtotal = row.find('.subtotal').text(); 
        id = row.find('.id').text();
        
  
        invoice_data.description[id-1]=description
        invoice_data.unit_price[id-1]=unit_price
        invoice_data.quantity[id-1]=quantity
        invoice_data.subtotal[id-1]=subtotal
        
  });
});
  



$('.newRow').on('click',function(e){
  items = items + 1
  template_data.invoice_data.items = items
  var newRow = `
<tr>
        <td><a class="control removeRow" href="#">x</a> 
        <span class="id" id="${items}" contenteditable>${items}</span></td>
        <td class="item_description" id="item_description" contenteditable></td>
        <td class="amount"><input type="text" placeholder="quantity"/></td>
        <td class="unit_price"><input type="text" placeholder="unit price"/></td>
        <td class="subtotal" id="subtotal"></td>
      </tr>`;
  $('.invoicelist-body tbody').append(newRow);
  e.preventDefault();
  calculate();
});

$('body').on('click','.removeRow',function(e){
  $(this).closest('tr').remove();
  e.preventDefault();
   // Update the number of items
   items = items - 1;
   template_data.invoice_data.items = items;
  
   // Update the IDs of remaining rows
   $('.id').each(function(index) {
     $(this).attr('id', index + 1);
     $(this).text(index + 1);
   });
  
   calculate();
});

$('#config_note').on('change',function(){
  $('body').toggleClass('shownote hidenote');
});

$('#to_from').on('change',function(){
  $('body').toggleClass('hide_to_from showdate');
});


async function gen_pdf(parameter,tempno){
  if(parameter == "invoice"){
    template_data.delivery_note = true
    let invoicedatahtml = tempno.invoiceDataHtml(template_data.invoice_data)
    var testTemp =tempno.templateHtml(template_data,invoicedatahtml)

  }
  if(parameter == "dvt"){
    template_data.delivery_note = false
    let invoicedatahtml = tempno.invoiceDataHtml(template_data.invoice_data)
    var testTemp =tempno.templateHtml(template_data,invoicedatahtml)

  }
let path = await getSavePath()
if(path){
  let res = pdf_gen.pdf_handler(testTemp,path)
  if(res){
    alert('file is saved')
  }else{
    alert('Error')
  }
}
}

function checker(jelem) {
   let visibility = jelem.css('display')
   if(visibility!="none"){
    return true
   }
   else{
    return false
   }
}
function getInvoiceData() {
  var company_details = $('.company_detail')
  var company_name = $('.company_name')
  var contact_info = $('.contact_info')
  var payment_info = $('.payment_info')
  var from = $('.from')
  var to = $('.to')
  var timeline = $('.timeline')
  var footnotes = $('.footnotes')
  var date = $('.datePicker').val()
  var total = $('.total').text()
  
  template_data.date = date
  template_data.total = total
  console.log(total)
  template_data.company_name =company_name.html()
  if(checker(from)){
    template_data.from =from.html()
  }
  if(checker(to)){
    template_data.to =to.html()
  }
  if(checker(footnotes)){
    template_data.footnotes =footnotes.html()
  }
  if(checker(payment_info)){
    template_data.payment_info =payment_info.html()
  }
  if(checker(timeline)){
    template_data.timeline =timeline.html()
  }
  if(checker(contact_info)){
    template_data.contact_info =contact_info.html()
  }
    if(checker(company_details)){
    template_data.company_details =company_details.html()
    console.log(company_details.html())
  }
  
}

async function handleDone(name) {
  const radios = document.getElementsByName(name);
  let selectedOption;;
  for (const radio of radios) {
      if (radio.checked) {
          selectedOption = radio.value;
          if(name=='optionsivc'){
            gen_pdf('invoice',templates[selectedOption])
            document.getElementById('popupinvoice').style.display = 'none'
          }
          if(name=='options'){
            gen_pdf('dvt',templates[selectedOption])
            document.getElementById('popupdnt').style.display = 'none'
          }
          
          break;
      }
  }
  if(!selectedOption){
      alert('Select a Template')
    
  }

 
}

$('.generateivc').on('click',function(e){
  document.getElementById('popupinvoice').style.display = 'flex'
  getInvoiceData()
  e.preventDefault();
  
 
});

$('.generatednt').on('click',function(e){
  document.getElementById('popupdnt').style.display = 'flex'
  getInvoiceData()
  e.preventDefault();
 
 
});




init_date();
calculate();

