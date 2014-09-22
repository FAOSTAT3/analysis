if (!window.FAT_STATS) {
	
	window.FAT_STATS = {

        track : function(category, action, label) {
            _gaq.push(['_trackEvent', category, action, label]);
        },

        show : function(code) {
            switch(code) {
                case 'classifications':
                    MS_STATS.showClassification();
                    break;
                case 'methodology_list':
                    MS_STATS.showMethodology();
                    break;
                case 'abbreviations':
                    MS_STATS.showAbbreviations();
                    break;
                case 'glossary':
                    MS_STATS.showGlossary();
                    break;
                case 'units':
                    MS_STATS.showUnits();
                    break;
                case 'local_currency':
                    MS_STATS.showCurrency();
                    break;
            }
        },

        download : function(code) {
            switch(code) {
                case 'classifications':
                    MS_STATS.exportClassification();
                    break;
                case 'methodology_list':
                    MS_STATS.exportMethodology();
                    break;
                case 'abbreviations':
                    MS_STATS.exportAbbreviations();
                    break;
                case 'glossary':
                    MS_STATS.exportGlossary();
                    break;
                case 'units':
                    MS_STATS.exportUnits();
                    break;
                case 'local_currency':
                    MS_STATS.exportCurrency();
                    break;
            }
        },
		
		showMethodology : function() {
            MS_STATS.track('METADATA_METHODOLOGY', 'Access to METADATA_METHODOLOGY', '');
        },

        exportMethodology : function() {
            MS_STATS.track('METADATA_METHODOLOGY', 'Export METADATA_METHODOLOGY', '');
        },

        showClassification : function() {
            MS_STATS.track('METADATA_CLASSIFICATION', 'Access to METADATA_CLASSIFICATION', '');
        },

        exportClassification : function() {
            MS_STATS.track('METADATA_CLASSIFICATION', 'Export METADATA_CLASSIFICATION', '');
        },

        showUnits : function() {
            MS_STATS.track('METADATA_UNITS', 'Access to METADATA_UNITS', '');
        },

        exportUnits : function() {
            MS_STATS.track('METADATA_UNITS', 'Export METADATA_UNITS', '');
        },

        showCurrency : function() {
            MS_STATS.track('METADATA_CURRENCY', 'Access to METADATA_CURRENCY', '');
        },

        exportCurrency : function() {
            MS_STATS.track('METADATA_CURRENCY', 'Export METADATA_CURRENCY', '');
        },

        showGlossary : function() {
            MS_STATS.track('METADATA_GLOSSARY', 'Access to METADATA_GLOSSARY', '');
        },

        exportGlossary : function() {
            MS_STATS.track('METADATA_GLOSSARY', 'Export METADATA_GLOSSARY', '');
        },

        showAbbreviations : function() {
            MS_STATS.track('METADATA_ABBREVIATIONS', 'Access to METADATA_ABBREVIATIONS', '');
        },

        exportAbbreviations : function() {
            MS_STATS.track('METADATA_ABBREVIATIONS', 'Export METADATA_ABBREVIATIONS', '');
        }
	
	};
	
}