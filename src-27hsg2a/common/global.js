
function trackEvent (product, technology) {
    console.log('trackEvent: ' + product + ', ' + technology);
    var title_pre = "BehindTheSite | "
    
    if( product != '' && technology == '') {
      // only product  
      document.title = title_pre + product;
      _gaq.push(['_trackEvent', 'Product', product]);
    } else if( product == '' && technology != '') {
      // only tech
      document.title = title_pre + technology;
      _gaq.push(['_trackEvent', 'Technology', technology]);
    } else if( product != '' && technology != '') {
      // both
      document.title = title_pre + product + " and " + technology;
      _gaq.push(['_trackEvent', 'Product', product]);
      _gaq.push(['_trackEvent', 'Technology', technology]);
    } else if( product == '' && technology == '') {
      // none
      document.title = title_pre + "A log of technology stacks";
    }
    
}
