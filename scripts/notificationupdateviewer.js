        /**
         * This code is closely based on view/notification/NotificationUpdateViewer.mxml
         * from the AIR client.
         */
        var closeTimer;
        var CLOSE_TIMEOUT = 5000; // How long to show the notification for. 5000
        var worker = new SharedWorker('/scripts/notification.js');
        var currentIndex = 0; // The current update we're showing.
        var updateQueue = []; // Updates we're currently showing.
        var isMouseOver = false;

        /**
         * Initialise the notification window. Note that we may create
         * multiple notification windows, so there shouldn't be any code
         * in here which will cause harm if run more than once.
         */
        var init = function () {
            // Set up the worker
            worker.port.addEventListener("message", acceptAction)
            worker.port.start();
            worker.port.postMessage("ready");
        };

        /**
         * Closes the window. Because next time we'll have a new window,
         * this effectively also clears and state.
         */
        var closeWindow = function(){
            if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
            }
            isMouseOver = false;
            window.close();
        };

        /**
         * Updates the preview which is currently being shown, as well as the update
         * counter.
         */
        var updatePreview = function () {
            document.getElementById("message").innerHTML = updateQueue[currentIndex].html;
            document.getElementById("columnTitle").innerHTML = updateQueue[currentIndex].columnTitle;
            document.getElementById("pageValTxt").innerHTML =  updateQueue.length - (currentIndex + 1);

            var pageNext = document.getElementById("pageNext");
            var pagePrev = document.getElementById("pagePrev");

            //Set correct classnames depending upon number of notifications
            var name = "notification-multiple";
            if (currentIndex > 0) {
                pagePrev.className = name;
            } else {
                pagePrev.className = '';
            }

            if (currentIndex < (updateQueue.length - 1)) {
                pageNext.className = name;
            } else {
                pageNext.className = '';
            }
        }

        /**
         * Cycle through updates
         * @param {Object} delta Whether to move forward (+ve) or backward (-ve)
         */
        var cycle = function (delta) {
            currentIndex = currentIndex + delta;

            // Do not allow looping
            currentIndex = Math.min(currentIndex, updateQueue.length - 1);
            currentIndex = Math.max(currentIndex, 0);

            updatePreview();
        };

        /**
         * Accept updates from the shared worker message channel.
         * @param {Object} e
         */
        var acceptAction = function (e) {
            if (e.data === "closeNotification") {
                closeWindow();
                return;
            } else if (e.data === "ready" ||
                       e.data.action) {
                // Message is passed from notification -> main page
                return;
            } else if (e.data.updates) {
                // there are updates to show!
                updateQueue = updateQueue.concat(e.data.updates);

                updatePreview();
                if (closeTimer) {
                    clearTimeout(closeTimer);
                    closeTimer = null;
                };

                if (!isMouseOver) {
                    closeTimer = setTimeout(closeWindow, CLOSE_TIMEOUT);
                }
            } else if (e.data.replaceID) {
                replace(e.data);
            }
        };

        var replace = function (data) {
            for (var i=0; i<updateQueue.length; i++) {
                var update = updateQueue[i];
                if (update.chirpID == data.replaceID &&
                    update.accountKey == data.accountKey) {
                    update.html = data.html;
                    if (i === currentIndex) {
                        updatePreview();
                    }
                    break;
                }
            }
        }

        // Mouse Events
        var handleMouseOver = function (event) {
            clearTimeout(closeTimer);
            isMouseOver = true;
        };

        var handleMouseOut = function (event) {
            if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
            };
            closeTimer = setTimeout(closeWindow, CLOSE_TIMEOUT);
            isMouseOver = false;
        };

        var handleMessageClick = function (event) {
            var element = event.target;
            var action = event.target.rel;

            if (!action) {
                element = event.target.parentElement;
                action = event.target.parentElement.rel;
            }

            if (!action || element.constructor !== HTMLAnchorElement) {
                return;
            }

            event.preventDefault();

            var actionData = {
                action : action,
                info : updateQueue[currentIndex],
                text : element.innerText,
                href : element.href
            };
            worker.port.postMessage(actionData);
        };