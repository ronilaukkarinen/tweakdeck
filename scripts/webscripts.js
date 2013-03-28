$(function() { 
	$("#tweakdeckversion").load("../VERSION");

//    Beginning scripts for web client
//    Beginning scripts for web client

        TD.util.i18n.localiseTags();

        // TD namespace created in main.js
        TD.storage.store.init(localStorage);
        TD.controller.clients.initialiseClients();
        TD.controller.feedManager.init();
        TD.controller.scheduler.initialiseColumns();
        TD.controller.notifications.init();

        TD.ui.columns.loadColumns(function() { TD.ui.columns.resize(); });
        TD.ui.main.init();
        TD.ui.compose.init();

        TD.sync.controller.init();
        setTimeout(TD.controller.harmonizer.start, 10000);

        if (TD.storage.store.get('debug') === true) {
            $('#debug_button').show();
        } else {
            $('#debug_button').hide();
        }

        // Tracking!
        TD.controller.stats.init();
        TD.controller.stats.appOpen();

        // Call home every 15 minutes
        setInterval(function () {
            TD.controller.stats.ping();
        }, 9e5);

        TD.ready = true;

	 });