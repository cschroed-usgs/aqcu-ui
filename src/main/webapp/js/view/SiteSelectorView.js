/**
 * Extends BaseView.js, see for full documentation of class functions.
 */
AQCU.view.SiteSelectorView = AQCU.view.BaseView.extend({
	templateName: 'site-selector',
       
	/**
	* Used by Backbone Stickit to bind HTML input elements to Backbone models.
	* This will be built up in the initialize function.
	*/
	bindings: {},

	events: {
		'click .site-selector-list-item': "onClickSiteItem",
		'click .site-selector-remove-site': "onClickSiteRemove"
	},
	
	initialize: function() {
		
		this.parentModel = this.options.parentModel;
		
		this.model = this.options.model || new Backbone.Model({
				selectedSite: null,
				siteList: []
			});

		this.model.bind("change:selectedSite", this.updateParentModelSelectedSite, this);
		this.model.bind("change:siteList", this.refreshView, this);		
		
		AQCU.view.BaseView.prototype.initialize.apply(this, arguments);
		
		//TODO hook up site selector widget
	},
	
	refreshView: function() {
		this.preRender();
		this.baseRender();
		this.afterRender();
	},
	
	/*override*/
	preRender: function() {
		//need to create a deep clone of the site list
		var clonedSiteList = [];
		var siteList = this.model.get("siteList");
		var selectedSite = this.model.get("selectedSite");
		for(var i = 0; i < siteList.length; i++) {
			var clonedSite = _.clone(siteList[i]);
			if(selectedSite && clonedSite.siteNumber == selectedSite.siteNumber) {
				clonedSite.selected = true;
			}
			clonedSiteList.push(clonedSite);
		}
		this.context = {
			sites : clonedSiteList
		}
	},
	
	afterRender: function() {
		//create and bind site search
		this.createSiteSelectorWidget();
		this.stickit();
	},
	
	createSiteSelectorWidget: function() {
		//TODO REPLACE THIS WITH WIDGET
		this.siteSelect = new AQCU.view.SelectField({
			router: this.router,
			fieldConfig: {
				fieldName : "select_site_no",
				displayName : "",
				description : ""
			},
			renderTo: this.$el.find('.site-select-widget'),
			startHidden: false
		});
		
		//TODO replace these dummy options with ajax loaded sites (avoid direct DOM)
		var selectField = this.$(".vision_select_field_select_site_no");
		selectField.append('<option value="">Choose site...</option>');
		selectField.append('<option value="111111">TEST SITE 1</option>');
		selectField.append('<option value="222222">TEST SITE 2</option>');
		selectField.append('<option value="333333">TEST SITE 3</option>');
		
		$.extend(this.bindings, this.siteSelect.getBindingConfig());
		

		this.model.bind("change:select_site_no", function() {
			var siteNumber = this.model.get("select_site_no");
			//TODO direct DOM access = bad, when we replace this widget, use model/view instead
			var siteName = this.$el.find(".site-select-widget").find("option[value='"+siteNumber+"']").html(); 
			this.addSiteToList(siteNumber, siteName);
		}, this);		
	},

	/**
	* Triggers an ajax call to load the select
	* @param params
	*/
	loadOptionsSiteSelect: function(param, targetField) {
				
	},
	addSiteToList: function(siteNumber, siteName) {
		var siteList = this.model.get("siteList");
		
		var exists = false;
		for(var i = 0; i < siteList.length; i++) {
			if(siteList[i].siteNumber == siteNumber) {
				exists = true;
				break;
			}
		}
		
		if(!exists) {
			var newSiteList = _.clone(siteList); //need to clone so that the change event is triggered
			newSiteList.push({siteNumber: siteNumber, siteName: siteName});
			this.model.set("siteList", newSiteList);
		}
	},
	
	removeBySiteNumber: function(siteNumber) {
		var currentList = this.model.get("siteList");
		var newList = [];
		for(var i = 0; i < currentList.length; i++) {
			if(this.model.get("selectedSite") && this.model.get("selectedSite").siteNumber == siteNumber) {
				this.model.set("selectedSite", null);
			}
			if(currentList[i].siteNumber != siteNumber) {
				newList.push(currentList[i]);
			}
		}
		this.model.set("siteList", newList);
	},
	
	onClickSiteItem: function(event) {
		var clickedDom = event.currentTarget;
		//Cheating by embedding values in HTML attributes, may want to 
		//use subviews/models to avoid this kind of hackery
		var siteNumber = $(clickedDom).attr("siteNumber"); 
		var siteName = $(clickedDom).attr("siteName"); 
		this.model.set("selectedSite", { siteNumber: siteNumber, siteName: siteName });
		this.refreshView();
		//mark selected
		this.$el.find("[siteNumber='"+siteNumber+"']").parent().addClass("");
	},

	onClickSiteRemove: function(event) {
		var clickedDom = event.currentTarget;
		//Cheating by embedding values in HTML attributes, may want to 
		//use subviews/models to avoid this kind of hackery
		var siteNumber = $(clickedDom).attr("siteNumber"); 
		this.removeBySiteNumber(siteNumber);
	},
	
	updateParentModelSelectedSite: function() {
		this.parentModel.set("selectedSite", this.model.get("selectedSite"))
	}
});