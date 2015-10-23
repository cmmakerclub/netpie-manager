'use strict';

/**
 * @ngdoc service
 * @name myNewProjectApp.mqttwsProvider
 * @description
 * # mqttwsProvider
 * Provider in the myNewProjectApp.
 */
angular.module('netpieManager')
    .provider('mqttwsProvider', function () {
        // $log.debug("mqttwsProvider")
        // Method for instantiating
        this.$get = function ($q, $window, $log) {
            // $log.debug("$get");
            var genClientId = function (str) {
                var time = new Date();
                return str + '.' + time.getTime();
            };
            return function socketFactory(pre_options) {
                var log = $log;
                var host;
                var port;
                var useTLS = false;
                var username = null;
                var password = null;
                var cleansession = true;
                var mqttClient;
                var reconnectTimeout = 10000;
                var events = {};
                var _options = {};
                var wrappedSocket = {
                    on: function (event, func) {
                        events[event] = func;
                    },
                    addListener: function (event, func) {
                        events[event] = func;
                    },
                    subscribe: function (topic, opts) {
                        var retFn = function() {
                            $log.info("SUBSCRIBING...", arguments);
                            opts = opts || { qos: 0 };
                            var defer = $q.defer();

                            opts.onSuccess =  function () {
                                $log.debug("PROVIDER", "subscribe succeeded.")
                                defer.resolve(mqttClient);
                            };

                            if(mqttClient.connected) {
                                $log.info('info', "client connected");
                            }
                            else {
                                $log.info('info', "NOT client connected");
                            }

                            mqttClient.subscribe(topic, opts);

                            $log.debug("PROVIDER", "SUB", topic, opts);
                            return defer.promise;
                        };
                        return retFn;
                    },
                    create: function (options) {
                        var defer = $q.defer();
                        options = angular.extend(_options, options);
                        host = options.host;
                        port = parseInt(options.port, 10);

                        $log.info("CREATE WITH CONFIG", options);
                        if (!options.clientId) {
                            $log.debug('not providing clientId');
                            $log.debug("PROVIDER", " clientId = ", options.clientId);
                            options.clientId = genClientId("RANDOM");
                        }

                        mqttClient = new Paho.MQTT.Client(host, port, options.clientId);
                        defer.resolve(mqttClient);
                        return defer.promise;
                    },
                    connect: function () {
                        var defer = $q.defer();

                        var onSuccess = function () {
                            var ev = events.connected || function () { };
                            $log.debug("PROVIDER", "CONNECTION CONNECTED");
                            ev.call(null, arguments);
                            defer.resolve(arguments);
                        };

                        var onFailure = function (message) {
                            $log.error("ON FAILURE", message);
                            // $window.setTimeout(wrappedSocket.connect, reconnectTimeout);
                            defer.reject(message);
                        };

                        var options = {
                            timeout: 3,
                            useSSL: useTLS,
                            // mqttVersionExplicit: true,
                            mqttVersion: 3,
                            cleanSession: cleansession,
                            onSuccess: onSuccess,
                            onFailure: onFailure
                        };

                        $log.debug("PROVIDER WITH ", "OPTIONS", _options)
                        if (!!_options.username) {
                            options.userName = _options.username;
                            options.password = _options.password;
                        }

                        mqttClient.connect(options);

                        mqttClient.onMessageArrived = function (message) {
                            var topic = message.destinationName;
                            var payload = message.payloadString;
                            var ev = events.message || function () { };
                            ev.apply(null, [topic, payload, message]);
                            var ev2 = events[topic.toString()] || function () { };
                            ev2.apply(null, [payload, message]);
                        };

                        return defer.promise;

                    }
                };


                // var callback = options.callback;


                return wrappedSocket;
            };
        };


    });
