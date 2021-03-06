
//*****************************************************************************
// JSON data sources

var TaxonomyJson = {
  get: function(cb, $http) {
    $http.get("/data/taxonomy.json")
    .success(function(data, status, headers, config){
      cb(data);
    });
  }
};

var StacksJson = {
  get: function(params, cb, $http) {
    if(params.start == 0) {
      $http.get("/data/stacks.json")
      .success(function(data, status, headers, config){
        cb(data);
      });
    } else {
      cb();
    }
  }
};

var ProductsJson = {
  get: function(cb, $http) {
    $http.get("/data/products.json")
    .success(function(data, status, headers, config){
      cb(data);
    });
  }
};

var UsedProductJson = {
  get: function(cb, $http) {
    $http.get("/data/used.json")
    .success(function(data, status, headers, config){
      cb(data);
    });
  }
};


//*****************************************************************************
// Services
// https://docs.angularjs.org/api/ngResource/service/$resource

angular.module('bts.services', ['ngResource'])

.factory('TaxonomySvc', ['$resource', function($resource){
  
  return $resource('http://api.behindthesite.com/v1/taxonomy/', {}, {
    get: {
      method: 'GET',
        cache : true,
        transformResponse: function (data, headers) {
            if(data) {
              data = JSON.parse(data);
            }
            return data;
          }
        }
    });
  }])

.factory('StackSvc', ['$resource', function($resource){
  
  return $resource('http://api.behindthesite.com/v1/stacks/', {}, {
    get: {
      method: 'GET',
        cache : true,
        transformResponse: function (data, headers) {
            if(data) {
              data = JSON.parse(data);
            }
            return data;
          }
        }
    });
  }])
  
.factory('ProductSvc', ['$resource', function($resource){
  
  return $resource('http://api.behindthesite.com/v1/products/', {}, {
    get: {
      method: 'GET',
        cache : true,
        transformResponse: function (data, headers) {
            if(data) {
              data = JSON.parse(data);
            }
            return data;
          }
        }
    });
  }])
  
.factory('UsedProductSvc', ['$resource', function($resource){
  
  return $resource('http://api.behindthesite.com/v1/products/used/', {}, {
    get: {
      method: 'GET',
        cache : true,
        transformResponse: function (data, headers) {
            if(data) {
              data = JSON.parse(data);
            }
            return data;
          }
        }
    });
  }])
  
.factory('SubmitSvc', ['$resource', function($resource){
  return $resource('http://api.behindthesite.com/v1/submit/', {}, {
    post: {
      method: 'POST',
        transformResponse: function (data, headers) {
            if(data) {
              data = JSON.parse(data);
            }
            return data;
          }
        }
    });
  }]);

//*****************************************************************************
// Directives
// https://docs.angularjs.org/guide/directive

angular.module('bts.directives', [])

// http://stackoverflow.com/questions/15207788/calling-a-function-when-ng-repeat-has-finished
.directive('onFinishRender', ['$timeout', function ($timeout) {
  return {
      restrict: 'A',
      link: function (scope, element, attr) {
          if (scope.$last === true) {
              $timeout(function () {
                  scope.$emit('ngRepeatFinished');
              });
          }
      }
  }
}])

.directive('affix', function () {
  Logger.debug('affix')
  return function(scope, element, attrs) {
    var ele = angular.element(element);

    scope.affix_widths = [];

    ele.affix({
      offset: {
        top: function() { 
          return  $('#main').offset().top;
        }
      }
    })

    ele.on('affix.bs.affix', function (e) {
      Logger.debug('affix.prior');

      var ths = ele.find('th');
      ths.each(function(i) { 
        scope.affix_widths[i] = $(this).width();
      })

    });

    ele.on('affixed.bs.affix', function (e) {
      Logger.debug('affix.post');
      var ths = ele.find('th');
      ths.each(function(i) {
        $(this).width(scope.affix_widths[i]);
        //Logger.debug(scope.affix_widths[i])
      })
    });
  };
})

/*
// has issues w/affix
.directive('collapse', function () {
  Logger.info('collapse');
  return function(scope, element, attrs) {
    var ele = angular.element(element);
    ele.on('shown.bs.collapse', function (e) {
      var pos = ele.offset().top - $('#header').height() - 35; // panel header ht+padding
      Logger.info('shown.bs.collapse: ' + pos );
      $('html, body').animate({
        scrollTop: pos
      }, 500);
    });
  };
})
*/

.directive('infopopup', ['$templateCache', function ($templateCache) {
  Logger.info('infopopup')
  return function(scope, element, attrs) {
    
    var ele = angular.element(element);
    var link = ele.find('.infopopup-link');

    var tmpl = $templateCache.get('main/popup-hover.html')

    link.data('state', 'hover');
    link.on('mouseenter', function (e) { 
      if (link.data('state') === 'hover') {
        var popupConfig = {
          html: true,
          title: attrs.title,
          content: attrs.content,
          placement: 'top',
          template: tmpl,
          trigger: 'manual'
        };
        link.popover(popupConfig);
        link.popover('show');
      }
    });
    link.on('mouseleave', function (e) { 
      if (link.data('state') === 'hover') {
        link.popover('hide');
      }
    });
    link.on('click', function (e) { 
      if (link.data('state') === 'hover') {
          $("a[href^='http']").attr("target","_blank");
          link.data('state', 'pinned');
          // already visible, no need to show again
      } else {
          link.data('state', 'hover');
          link.popover('hide');
      }
    });

    ele.on('shown.bs.popover', function () {
      ele.find('.close-btn').click( function () {
        link.data('state', 'hover');
        link.popover('hide');
      });        
    });
  };
}])

.directive('product', ['$templateCache', function ($templateCache) {
  Logger.info('product')
  return function(scope, element, attrs) {
//    Logger.debug(attrs);
    var ele = angular.element(element);
    var link = ele.find('.product-link');

    var tmpl = $templateCache.get('main/popup-hover.html');

    link.data('state', 'hover');
    link.on('mouseenter', function (e) { 
      if (link.data('state') === 'hover') {
        var contentHtml = $('#' + attrs.divid).html();
        //Logger.debug(attrs.divid + ": " + contentHtml);
        var popupConfig = {
          html: true,
          title: attrs.title,
          content: contentHtml,
          placement: 'top',
          template: tmpl,
          trigger: 'manual'
        };
        link.popover(popupConfig);
        link.popover('show');
      }
    });
    link.on('mouseleave', function (e) { 
      if (link.data('state') === 'hover') {
        link.popover('hide');
      }
    });
    link.on('click', function (e) { 
      if (link.data('state') === 'hover') {
          $("a[href^='http']").attr("target","_blank");
          link.data('state', 'pinned');
          // already visible, no need to show again
      } else {
          link.data('state', 'hover');
          link.popover('hide');
      }
    });

    ele.on('shown.bs.popover', function () {
      ele.find('.close-btn').click( function () {
        link.data('state', 'hover');
        link.popover('hide');
      });        
    });
  };
}])


.directive('productdetail', ['$templateCache', function ($templateCache) {
  Logger.info('productdetail');
  return function(scope, element, attrs) {
//    Logger.debug(attrs);
    var ele = angular.element(element);
    var link = ele.find('.product-detail-link');
    
    ele.on('shown.bs.popover', function () {
      ele.find('.close-btn').click( function () {
        link.popover('hide');
      });        
    });

    link.on('click', function (e) { 
      Logger.info('productdetail: ' + attrs.product);
            
      var tmpl = $templateCache.get('main/popup.html');
      var contentHtml = $templateCache.get('main/modal-product-detail.html'); //$('#product-detail-tmpl').html();
    
      var popupConfig = {
        html: true,
        title: attrs.product,
        content: contentHtml,
        placement: 'top',
        template: tmpl,
        trigger: 'manual'
      };
      link.popover(popupConfig);
      link.popover('show');

    });
  };
}]);

//*****************************************************************************
// filters
// https://docs.angularjs.org/guide/filter

angular.module('bts.filters', [])

.filter('ws', function () {
  return function (input) {
    if (input) {
      return input.toLowerCase().replace(/[^a-z_]/g, '_');
    }
  };
})

.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

//*****************************************************************************
// Controllers
// https://docs.angularjs.org/api/ng/directive/ngController

angular.module('bts.controllers', [])

.controller('SubmissionForm', ['$scope', '$http', 'SubmitSvc', 'ProductSvc', function($scope, $http, SubmitSvc, ProductSvc) {
  
  $scope.products = [];
  
  $scope.init = function () {
    Logger.info('SubmissionForm.init');
    $scope.clear();
    $scope.reset();
    $scope.add();
    $scope.update($scope.submission);
  }
  
  $scope.getData = function () {
    Logger.info('SubmissionForm.getData');
    ProductsJson.get(function(res) {
      //alert('get');
      Logger.info('ProductSvc.get');
      Logger.debug(res);
      for(var i=0; i < res.products.length; i++) {
        $scope.products.push({
          'value': res.products[i].id,
          'key': res.products[i].name
        });
      }
      $scope.init();
      //alert('done');
    }, $http);
    return true;
  }
  
  $scope.clear = function () {
    $scope.master = {};
    $scope.master.tiers = [];
  }
    
  $scope.add = function() {
    var newItemNo = $scope.submission.tiers.length+1;
    Logger.debug('SubmissionForm.add: ' + newItemNo)
    $scope.submission.tiers.push({
      'id': newItemNo,
      'product': '-1'
    });
  };

  $scope.delete = function(id) {
    Logger.info('SubmissionForm.delete: ' + id);
    var tiers = $scope.submission.tiers;
    var newArr = [];
    for(var i=0; i < tiers.length; i++) {
      if( tiers[i].id != id ) {
        newArr.push( tiers[i] );
      }
    }
    for(var i=0; i < newArr.length; i++) {
      newArr[i].id = i+1;
    }
    $scope.submission.tiers = newArr;
  };
  
  $scope.update = function(submission) {
    $scope.master = angular.copy(submission);
  }

  $scope.save = function(submission) {
    $scope.master = angular.copy(submission);
    Logger.info('SubmissionForm.save');
    Logger.debug($scope.master);
    
    SubmitSvc.post( $scope.master, function (res) {
      Logger.info('SubmissionForm.saved');
      Logger.debug(res);
      $scope.init();
      $('#SubmissionModal').modal('hide');
    });
  };

  $scope.reset = function() {
    $scope.submission = angular.copy($scope.master);
  };

  $scope.isUnchanged = function(submission) {
    return angular.equals(submission, $scope.master);
  };
  
  $scope.getData();

}])

.controller('MainCtrl', 
  ['$scope', '$routeParams', '$location', '$timeout', '$sce', '$filter', '$http', 'Common', 'ConfigSvc', 'TaxonomySvc', 'StackSvc', 'UsedProductSvc', 'DoNotReloadCurrentTemplate', function ($scope, $routeParams, $location, $timeout, 
      $sce, $filter, $http, Common, ConfigSvc, TaxonomySvc, StackSvc, UsedProductSvc, DoNotReloadCurrentTemplate) {
        
  DoNotReloadCurrentTemplate($scope);

  var vm = this;
  
  vm.env = undefined;
  vm.isMobile = Common.isMobile;
  vm.isMobileDevice = Common.isMobileDevice;
  vm.isMobileTabletDevice = Common.isMobileTabletDevice;
  vm.busy = true;
  vm.theme = '';
  vm.query_tech = '';
  vm.query_tech_typeahead = '';
  vm.query_product = '';
  vm.query_product_typeahead = '';
  vm.headers = [];
  vm.products = [];
  vm.tech_select_list = [];
  vm.products_select_list = [];
  
  vm.currentPage = 0;
  // pagination, page size loaded limited by infinitePageSize if greater, see pageLimit. use pageLimit in html ng-repeat
  vm.pageSize = 10;  
  vm.total = 0;
  
  vm.infiniteCount = 0;
  vm.infinitePageSize = 10;
  
  vm.hasMore = true;
  
  vm.onThemeChange = function () {
    themeLink = $('#theme-link')
    themeLink.attr('href', vm.env.vendor + 'vendor/bootswatch/' + vm.theme + '/bootstrap.min.css');
    Localstore.set('theme', vm.theme);
  }

  vm.setQueryProduct = function ($item, $model, $label) {
    Logger.info('vm.setQueryProduct: ' + JSON.stringify($item) + ', ' + $label);
    vm.query_product = vm.query_product_typeahead = $label;
    vm.onSelectionChange();
  }

  vm.setQueryTech = function ($item, $model, $label) {
    Logger.info('vm.setQueryTech: ' + JSON.stringify($item) + ', ' + $label);
    vm.query_tech = vm.query_tech_typeahead = $label;
    vm.onSelectionChange();
  }
  
  vm.setQueryProductTech = function (product, tech) {
    Logger.info('vm.setQuery: ' + JSON.stringify(product) + ', ' + JSON.stringify(tech));
    vm.query_product = vm.query_product_typeahead = product;
    vm.query_tech = vm.query_tech_typeahead = tech;
    vm.onSelectionChange();
  }
  
  // Only called on user changed selection
  vm.onSelectionChange = function () {
    Logger.info('vm.onSelectionChange: ' + vm.query_product + ', ' + vm.query_tech);
    
    trackEvent(vm.query_product, vm.query_tech);
    
    if( vm.query_product != '' && vm.query_tech == '') {
      // only query_product  
      $location.path('/stack/' + vm.query_product);
    } else if( vm.query_product == '' && vm.query_tech != '') {
      // only query_tech
      $location.path('/tech/' + vm.query_tech);
    } else if( vm.query_product != '' && vm.query_tech != '') {
      // both
      $location.path('/highlight/' + vm.query_product + '/' + vm.query_tech);
    } else if( vm.query_product == '' && vm.query_tech == '') {
      // clear
      $location.path('/');
    }
    // reset to page 1
    vm.currentPage = 0;
    // get all data to enable complete filtering
    if(vm.isFiltering()) {
      vm.getStacks(vm.products.length, 1000);
    }
  }
  
  vm.clearProduct = function () {
    vm.query_product = '';
    vm.query_product_typeahead = ' ';
    
    vm.onSelectionChange();
  }
  
  vm.clearTech = function () {
    vm.query_tech = '';
    vm.query_tech_typeahead = ' ';
    
    vm.onSelectionChange();
  }
  
  vm.clearSelections = function () {
    vm.query_tech = '';
    vm.query_tech_typeahead = ' ';
    vm.query_product = '';
    vm.query_product_typeahead = ' ';
    
    vm.onSelectionChange();
  }
  
  // only called on page load
  vm.updateSelections = function () {
    Logger.info('$routeParams.selectedProduct:' + $routeParams.selectedProduct );
    Logger.info('$routeParams.selectedTech:' + $routeParams.selectedTech );
    if($routeParams.selectedProduct == undefined) {
      $routeParams.selectedProduct = "";
    }
    vm.query_product = $routeParams.selectedProduct;
    vm.query_product_typeahead = $routeParams.selectedProduct;
  
    if($routeParams.selectedTech == undefined) {
      $routeParams.selectedTech = "";
    } 
    
    vm.query_tech = $routeParams.selectedTech;
    vm.query_tech_typeahead = $routeParams.selectedTech;
    
    trackEvent(vm.query_product, vm.query_tech);
    
    // get all data to enable complete filtering
    if(vm.isFiltering()) {
      vm.getStacks(vm.products.length, 1000);
    }
  }
  
  vm.getFilteredProducts = function () {
    // https://docs.angularjs.org/api/ng/filter/filter
    return $filter('filter')(vm.products, vm.filter);
  }
  
  vm.isFiltering = function () {
    var retVal = false;
    if(vm.query_product || vm.query_tech) {
      retVal = true;
    }
    Logger.debug('MainCtrl.isFiltering: ' + retVal);
    return retVal;
  }
  
  vm.numberOfPages = function () {
    var numPages = vm.total / vm.pageSize;
    if(vm.isFiltering()) {
      numPages = vm.getFilteredProducts().length / vm.pageSize;
    }
    numPages = Math.ceil(numPages)
    if(numPages == 0) numPages = 1;
    return numPages;
  }
  
  vm.disablePrev = function () {
    return (vm.currentPage == 0);
  }
  
  vm.disableNext = function () {
    return (vm.currentPage+1) == vm.numberOfPages();
  }
  
  vm.nextPage = function () {
    vm.getStacks(vm.products.length, vm.pageSize, function () {
      vm.currentPage = vm.currentPage+1;
    });
  }
  
  vm.prevPage = function () {
    vm.currentPage = vm.currentPage-1;
  }
  
  vm.getTotal = function () {
    Logger.debug('vm.getTotal: ' + vm.total);
    if(vm.isFiltering()) {
      return vm.getFilteredProducts().length;
    }
    return vm.total;
  }
  
  // pagination, page size loaded limited by infinitePageSize if greater, see pageLimit. use pageLimit in html ng-repeat
  vm.pageLimit = function () {
    var ret = vm.pageSize;
    Logger.debug('vm.pageLimit: PRE vm.infinitePageSize: ' + vm.infiniteCount + " < " + vm.pageSize);
    if( vm.infiniteCount < vm.pageSize ) {
      ret = vm.infiniteCount;
    }
    Logger.debug('vm.pageLimit: POST: ' + ret);
    return ret;
  }
  
  // respect page size
  // was return (vm.infiniteCount + vm.infinitePageSize < vm.pageSize);
  vm.shouldIncrementInfiniteCount = function () {
    if (vm.pageLimit() < vm.pageSize) {
      return true;
    }
    return false;
  }
  
  // assumes called called vm.shouldIncrementInfiniteCount() already
  vm.incrementInfiniteCount = function () {
    vm.infiniteCount = vm.infiniteCount + vm.infinitePageSize;
    if(vm.infiniteCount >= vm.products.length) {
      vm.infiniteCount = vm.products.length;
      vm.hasMore = false;
    }
    Logger.info('MainCtrl.incrementInfiniteCount: ' + vm.infiniteCount);
  }

  vm._escapeRegExp = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  vm._matchProduct = function (element) {
    Logger.debug('_matchProduct');
    var match = false;
    //var re = new RegExp( vm._escapeRegExp( vm.query_product ), 'i' );
    //match = (element.name.match(re) ) ? true : false;
    if(element && element.name) {
      match = (element.name.toLowerCase() == vm.query_product.toLowerCase());
    }
    return match;
  }

  vm._matchTech = function (element, q) {
    Logger.debug('_matchMatch: ' + q);
    var match = false;
    var m = false;
    var t, p;
    //var re = new RegExp( vm._escapeRegExp( q ), 'i' );
    for(var i=0; i < element.tiers.length; i++) {
      t = element.tiers[i];
      for(var j=0; j < t.length; j++) {
        p = t[j].product
        //m = p.name.match(re);
        m = (p.name.toLowerCase() == q.toLowerCase());
        Logger.debug( p.name + ',' + m);
        if(m) {
          match = true;
          break;
        }
      }
    }
    return match;
  }
  
  vm.highlight = function (text) {
    if (!vm.query_tech) {
        return $sce.trustAsHtml(text);
    }
    return $sce.trustAsHtml(text.replace(vm.query_tech, '<span class="highlight">$&</span>','gi'));
  }

  vm.filter = function (element) {
    Logger.trace('MainCtrl.filter');
    Logger.trace(element);
    
    if(vm.query_product == undefined) vm.query_product = '';
    Logger.trace('vm.query_tech: ' + vm.query_tech);
    Logger.trace('vm.query_product: ' + vm.query_product);

    var match = false;

    if( vm.query_product == '' && vm.query_tech == '') {
      Logger.trace('No filter');
      match = true;
    } else if( vm.query_product != '' && vm.query_tech == '') {
      Logger.trace('Only product');
      match = vm._matchProduct(element);
    } else if( vm.query_product == '' && vm.query_tech != '') {
      Logger.trace('Only text');
      match = vm._matchTech(element, vm.query_tech);
    } else if( vm.query_product != '' && vm.query_tech != '') {
      Logger.trace('Both product and text');
      match = vm._matchProduct(element) && vm._matchTech(element, vm.query_tech);
    } else  {
      Logger.trace('Invalid case.');
      match = true;
    }
    return match;
  }
  
  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    Logger.info('ngRepeatFinished');
    $("a[href^='http']").attr("target","_blank");
  });
  
  vm.backToTop = function (id) {
    Logger.info('MainCtrl.backToTop: ' + id);
    var pos = $('#main').offset().top;
    if(id) {
      pos = $('#' + id + '-panel').offset().top;
    }
    $('html, body').animate({
      scrollTop: pos
    }, 500);
  }
  
  vm.updateBusy = function () {
    vm.busy = false;
    Logger.info('MainCtrl.updateBusy: ' + vm.busy);
  }

  vm.getTaxonomyIds = function (taxonomy) {
    var ids = [];
    ids.push( taxonomy.id );
    for( var i in taxonomy.children ) {
      var c = taxonomy.children[i];
      ids = ids.concat( vm.getTaxonomyIds(c) );
    }
    return ids;
  }

  vm.findHeaderIndex = function (tier) {
    var id = tier.category.id;
//    Logger.trace('Searching for: ' + id + ' ' + typeof(id) );
    for(var i in vm.headers) {
//      Logger.trace('In: ' + vm.headers[i].ids);
      var index = $.inArray(id, vm.headers[i].ids);
      if(index > -1) {
        return i;
      }
    }
    return -1;
  }
  
  vm.mobileHasMore = function () {
    if(vm.isFiltering) {
      return vm.infiniteCount < vm.getFilteredProducts().length ;
    }
    return vm.infiniteCount < vm.total;
  }
  
  // mobile only, user click, will get additional data regardless of pagination
  vm.mobileGetAdditionalData = function () {
    Logger.info('MainCtrl.mobileGetAdditionalData');
      vm.getStacks(vm.products.length, vm.pageSize, function() {
      // allow the busy icon to display before rendering (freezes otherwise and busy indicator doesnt show)
      vm.busy = true;
      $timeout(function () {
        Logger.info('MainCtrl.mobileGetAdditionalData: Timeout');
        vm._getAdditionalData();
      }, 500);
    });
  }
  
  // inifite loading within pagination
  vm.infiniteGetAdditionalData = function () {
    Logger.debug('MainCtrl.infiniteGetAdditionalData');
    if( vm.shouldIncrementInfiniteCount() ) {
      vm._getAdditionalData();
    }
  }
  
  // internal keep busy to prevent too many re-triggers
  vm._getAdditionalData = function () {
    vm.busy = true;
    vm.incrementInfiniteCount();
    Logger.debug('MainCtrl._getAdditionalData: ' + vm.infiniteCount);
    $timeout(function () {
      Logger.debug('MainCtrl._getAdditionalData: Timeout');
      vm.updateBusy();
    }, 2000);
  }
  
  vm.getData = function () {
    Logger.info('MainCtrl.getData()');
    vm.busy = true;
    TaxonomyJson.get(function(res) {
      var taxonomy = res.taxonomy;
      Logger.info('MainCtrl.Taxonomy: ' + taxonomy.length  );
      for(var index in taxonomy) {
        var t = taxonomy[index];
        var h = { name: t.name }
        h.ids = vm.getTaxonomyIds( t );
        Logger.debug( h.name + ', ' + h.ids);
        vm.headers.push( h )
      }
      vm.updateBusy();
      vm.getStacks(0, vm.pageSize, vm.getSelectListData);
    }, $http);
  }
  
  vm.getStacks = function (start, count, callback) {
    Logger.info('MainCtrl.getStacks: ' + arguments);
    if( vm.products.length <= start) {
      vm.busy = true;
      StacksJson.get({start: start, count: count}, function(res) {
        if(res) {
          var products = res.products;
          Logger.info('MainCtrl.Products: ' + products.length  + '  total: ' + res.total + '   count: ' + res.count);
          vm.total = parseInt(res.total);
          for(var index in products) {
            var product = products[index];
            var model = { 
              name: product.name,
              website: product.website,
              description: product.description,
              twitter: product.twitter,
              facebook: product.facebook,
              irc: product.irc,
              blogs: product.blogs,
              repo: product.repo,
              issues: product.issues,
              docs: product.docs,
              updated: product.stack.updated,
              insight: marked( product.stack.insight ),
              notes: marked( product.stack.notes ),
              references: marked( product.stack.references )
            };
            model.company = product.company;
            model.tiers = [];
            for(var header in vm.headers) {
              model.tiers[header] = [];
              model.tiers[header].name = vm.headers[header].name;
            }
            var tiers = product.stack.tiers;
            for(var tier in tiers) {
              var index = vm.findHeaderIndex( tiers[tier] );
              if(tiers[tier].notes) {
                tiers[tier].notes = marked( tiers[tier].notes );
              }
    //          Logger.trace('index: ' + index);
    //          Logger.trace(tiers[tier].product);
              model.tiers[index].push( tiers[tier] )
            }
    //        Logger.trace( i.name );
    //        Logger.trace( i.tiers );
            vm.products.push( model )
          } 
        }
      
        vm.incrementInfiniteCount();
        vm.updateBusy();
        if(callback) {
          callback();
        }
      }, $http);
    } else {
      vm.updateBusy();
      if(callback) {
        callback();
      }
    }
      // https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$broadcast downward
      // https://docs.angularjs.org/api/ng/type/$rootScope.Scope#emit upward
      //  $scope.$emit('MainCtrl.completed');    
      //  $scope.$broadcast('MainCtrl.completed');
  }
  
  vm._buildUsedProductList = function (data) {
      var list = [ {id:'', name:''}]
      if(data) {
        for(var i=0; i < data.length; i++) {
          Logger.debug(data[i].name)
          list.push({
            'id': data[i].name,
            'name': data[i].name
          });
        }
  
        list = list.sort(function (a, b) {
          if(a.id == '') {
            return -1;
          }
          if(b.id == '') {
            return 1;
          }
          if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          }
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
          }
          return 0
        });
      }
      vm.products_select_list = list;
  }
  
  vm._buildUsedTechList = function (data) {
      var list = [ {id:'', name:''}]
      if(data) {
        for(var i=0; i < data.length; i++) {
          Logger.debug(data[i].name)
          list.push({
            'id': data[i].name,
            'name': data[i].name
          });
        }
      }
      vm.tech_select_list = list;
  }

  vm.getSelectListData = function () {
    UsedProductJson.get(function(res) {
      Logger.info('MainCtrl.getSelectListData: UsedProductSvc.get');
      
      vm._buildUsedTechList(res.technologies);
      vm._buildUsedProductList(res.products);
      
      $timeout(function () {
        Logger.info('MainCtrl.updateSelections: Timeout');
        vm.updateSelections();
      }, 500);
    }, $http);
  }
  
  
  vm.init = function () {
    Logger.event('MainCtrl.init()')
    
    ConfigSvc.get(function(data) {
      Logger.info('MainCtrl.ConfigSvc');
      
      vm.env = data;
      
      if(vm.env.force_theme) {
        vm.theme = vm.env.theme;
        Localstore.set('theme', vm.theme);
      } else {
        vm.theme = Localstore.get('theme');
        if(!vm.theme) {
          vm.theme = vm.env.theme;
          Localstore.set('theme', vm.theme);
        }
      }
      
      vm.onThemeChange();  
      vm.getData();

    });
    
  }

  vm.init();

}]);
