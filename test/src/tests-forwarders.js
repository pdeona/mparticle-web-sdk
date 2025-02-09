var TestsCore = require('./tests-core'),
    getEvent = TestsCore.getEvent,
    getForwarderEvent = TestsCore.getForwarderEvent,
    server = TestsCore.server,
    apiKey = TestsCore.apiKey,
    setLocalStorage = TestsCore.setLocalStorage,
    MPConfig = TestsCore.MPConfig,
    MessageType = TestsCore.MessageType,
    MockForwarder = TestsCore.MockForwarder,
    Forwarders = require('../../src/forwarders'),
    Helpers = require('../../src/helpers'),
    Consent = require('../../src/consent');

describe('forwarders', function() {
    it('should invoke forwarder setIdentity on initialized forwarders (debug = false)', function(done) {
        mParticle.reset(MPConfig);
        window.mParticle.config.identifyRequest = {
            userIdentities: {
                google: 'google123'
            }
        };

        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);

        mockForwarder.configure();
        mParticle.init(apiKey);

        mockForwarder.instance.should.have.property('setUserIdentityCalled', true);

        mockForwarder.instance.userIdentities.should.have.property('4', 'google123');

        window.mParticle.identifyRequest = {};

        done();
    });

    it('should permit forwarder if no consent configured.', function (done) {
        mParticle.reset(MPConfig);

        mParticle.preInit.isDevelopmentMode = true;
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            id: 1,
            isDebug: true,
            hasDebugString: false,
            isVisible: true,
            filteringConsentRuleValues: {}
        });

        mParticle.init(apiKey);

        var enabled = Forwarders.isEnabledForUserConsent(mockForwarder.instance.filteringConsentRuleValues, null);
        enabled.should.be.ok();
        done();
    });

    it('should not permit forwarder if consent configured but there is no user.', function (done) {
        var enableForwarder = true;
        var consented = false;
        mParticle.reset(MPConfig);
        mParticle.preInit.isDevelopmentMode = true;
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            id: 1,
            isDebug: true,
            hasDebugString: false,
            isVisible: true,
            filteringConsentRuleValues: {
                includeOnMatch: enableForwarder,
                values: [{
                    consentPurpose: '123',
                    hasConsented: consented
                }]
            }
        });
        mParticle.init(apiKey);
        var enabled = Forwarders.isEnabledForUserConsent(mockForwarder.instance.filteringConsentRuleValues, null);
        enabled.should.not.be.ok();
        done();
    });

    var MockUser = function () {
        var consentState = null;
        return {
            setConsentState: function (state) {
                consentState = state;
            },
            getConsentState: function () {
                return consentState;
            }
        };
    };

    it('should disable forwarder if consent has been rejected.', function (done) {
        var enableForwarder = false;
        var consented = false;
        mParticle.reset(MPConfig);
        mParticle.preInit.isDevelopmentMode = true;
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            id: 1,
            isDebug: true,
            hasDebugString: false,
            isVisible: true,
            filteringConsentRuleValues: {
                includeOnMatch: enableForwarder,
                values: [{
                    consentPurpose: mParticle.generateHash('1' + 'foo purpose 1'),
                    hasConsented: consented
                }]
            }
        });

        mParticle.init(apiKey);


        var consentState = Consent
            .createConsentState()
            .addGDPRConsentState('foo purpose 1', Consent.createGDPRConsent(consented));
        var user = MockUser();
        user.setConsentState(consentState);
        var enabled = Forwarders.isEnabledForUserConsent(mockForwarder.instance.filteringConsentRuleValues, user);
        enabled.should.not.be.ok();
        done();
    });

    it('should disable forwarder if consent has been accepted.', function (done) {
        var enableForwarder = false;
        var consented = true;
        mParticle.reset(MPConfig);
        mParticle.preInit.isDevelopmentMode = true;
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            id: 1,
            isDebug: true,
            hasDebugString: false,
            isVisible: true,
            filteringConsentRuleValues: {
                includeOnMatch: enableForwarder,
                values: [{
                    consentPurpose: mParticle.generateHash('1' + 'foo purpose 1'),
                    hasConsented: consented
                }]
            }
        });

        mParticle.init(apiKey);

        var consentState = Consent
            .createConsentState()
            .addGDPRConsentState('foo purpose 1', Consent.createGDPRConsent(consented));
        var user = MockUser();
        user.setConsentState(consentState);
        var enabled = Forwarders.isEnabledForUserConsent(mockForwarder.instance.filteringConsentRuleValues, user);
        enabled.should.not.be.ok();
        done();
    });

    it('should enable forwarder if consent has been rejected.', function (done) {
        var enableForwarder = true;
        var consented = false;
        mParticle.reset(MPConfig);
        mParticle.preInit.isDevelopmentMode = true;
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            id: 1,
            isDebug: true,
            hasDebugString: false,
            isVisible: true,
            filteringConsentRuleValues: {
                includeOnMatch: enableForwarder,
                values: [{
                    consentPurpose: mParticle.generateHash('1' + 'foo purpose 1'),
                    hasConsented: consented
                }]
            }
        });

        mParticle.init(apiKey);

        var consentState = Consent
            .createConsentState()
            .addGDPRConsentState('foo purpose 1', Consent.createGDPRConsent(consented));
        var user = MockUser();
        user.setConsentState(consentState);
        var enabled = Forwarders.isEnabledForUserConsent(mockForwarder.instance.filteringConsentRuleValues, user);
        enabled.should.be.ok();
        done();
    });

    it('should enable forwarder if consent has been accepted.', function (done) {
        var enableForwarder = true;
        var consented = true;
        mParticle.reset(MPConfig);
        mParticle.preInit.isDevelopmentMode = true;
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            id: 1,
            isDebug: true,
            hasDebugString: false,
            isVisible: true,
            filteringConsentRuleValues: {
                includeOnMatch: enableForwarder,
                values: [{
                    consentPurpose: mParticle.generateHash('1' + 'foo purpose 1'),
                    hasConsented: consented
                }]
            }
        });

        mParticle.init(apiKey);

        var consentState = Consent
            .createConsentState()
            .addGDPRConsentState('foo purpose 1', Consent.createGDPRConsent(true));
        var user = MockUser();
        user.setConsentState(consentState);
        var enabled = Forwarders.isEnabledForUserConsent(mockForwarder.instance.filteringConsentRuleValues, user);
        enabled.should.be.ok();
        done();
    });

    it('does not initialize a forwarder when forwarder\'s isDebug != mParticle.isDevelopmentMode', function(done) {
        mParticle.reset(MPConfig);
        mParticle.preInit.isDevelopmentMode = false;
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            id: 1,
            isDebug: true,
            hasDebugString: false,
            isVisible: true
        });

        mParticle.init(apiKey);
        Should(mockForwarder.instance).not.be.ok();
        mParticle._getActiveForwarders().length.should.equal(0);
        Should(mParticle.preInit.configuredForwarders.length).equal(0);

        done();
    });

    it('initializes a forwarder with isDebug = false && mParticle.preInit.isDevelopmentMode = false', function(done) {
        mParticle.reset(MPConfig);
        mParticle.preInit.isDevelopmentMode = false;
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            id: 1,
            isDebug: false,
            hasDebugString: 'false',
            isVisible: true
        });

        mParticle.init(apiKey);

        mockForwarder.instance.should.have.property('initCalled', true);
        mParticle._getActiveForwarders().length.should.equal(1);
        Should(mParticle.preInit.configuredForwarders.length).equal(1);

        done();
    });

    it('initializes a forwarder with isDebug = true && mParticle.preInit.isDevelopmentMode = true', function(done) {
        mParticle.reset(MPConfig);
        mParticle.preInit.isDevelopmentMode = true;
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            id: 1,
            isDebug: true,
            hasDebugString: false,
            isVisible: true
        });

        mParticle.init(apiKey);
        mockForwarder.instance.should.have.property('initCalled', true);
        Should(mParticle.preInit.configuredForwarders.length).equal(1);

        done();
    });

    it('initializes forwarders when isDebug = mParticle.preInit.isDevelopmentMode', function (done) {
        mParticle.reset(MPConfig);
        mParticle.preInit.isDevelopmentMode = false;
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            id: 1,
            isDebug: true,
            hasDebugString: false,
            isVisible: true
        });

        // tries to configure a second forwarder with isDebug = falsle instead of true as above
        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            id: 1,
            isDebug: false,
            hasDebugString: false,
            isVisible: true
        });

        mParticle.init(apiKey);
        mParticle._getActiveForwarders().length.should.equal(1);
        Should(mParticle.preInit.configuredForwarders.length).equal(1);
        Should(mParticle.preInit.forwarderConstructors.length).equal(1);

        done();
    });

    it('sends events to forwarder when forwarder\'s isDebug = mParticle.preInit.isDevelopmentMode ', function(done) {
        mParticle.reset(MPConfig);
        mParticle.preInit.isDevelopmentMode = true;
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            id: 1,
            isDebug: true,
            hasDebugString: false,
            isVisible: true
        });

        mParticle.init(apiKey);
        mParticle.logEvent('send this event to forwarder');
        mockForwarder.instance.should.have.property('processCalled', true);

        done();
    });

    it('sends events to forwarder v1 endpoint when mParticle.preInit.isDevelopmentMode = config.isDebug = false', function(done) {
        mParticle.reset(MPConfig);
        mParticle.preInit.isDevelopmentMode = false;
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mockForwarder.configure();
        mParticle.init(apiKey);

        server.requests = [];
        mParticle.logEvent('send this event to forwarder');

        mockForwarder.instance.should.have.property('processCalled', true);
        server.requests[1].urlParts.path.should.equal('/v1/JS/test_key/Forwarding');

        done();
    });

    it('sends forwarding stats to v2 endpoint when featureFlag setting of batching is true', function(done) {
        mParticle.reset(MPConfig);
        var clock = sinon.useFakeTimers();
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mockForwarder.configure();

        mParticle._configureFeatures({batching: true});
        mParticle.init(apiKey);
        server.requests = [];

        mParticle.logEvent('send this event to forwarder',
            mParticle.EventType.Navigation,
            { 'my-key': 'my-value' });
        clock.tick(5000);
        var event = getForwarderEvent('send this event to forwarder', true);
        Should(event).should.be.ok();

        server.requests[1].urlParts.path.should.equal('/v2/JS/test_key/Forwarding');
        event.should.have.property('mid', 1);
        event.should.have.property('esid', 1234567890);
        event.should.have.property('n', 'send this event to forwarder');
        event.should.have.property('attrs');
        event.should.have.property('sdk', mParticle.getVersion());
        event.should.have.property('dt', MessageType.PageEvent);
        event.should.have.property('et', mParticle.EventType.Navigation);
        event.should.have.property('dbg', mParticle.preInit.isDevelopmentMode);
        event.should.have.property('ct');
        event.should.have.property('eec', 0);
        clock.restore();

        Should(Object.keys(mParticle.preInit.featureFlags).length).equal(1);

        done();
    });

    it('should not send forwarding stats to invisible forwarders', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mockForwarder.configure();
        mParticle.init(apiKey);
        mockForwarder.instance.isVisible = false;

        mParticle.logEvent('send this event to forwarder',
            mParticle.EventType.Navigation,
            { 'my-key': 'my-value' });

        var event = getEvent('send this event to forwarder', true);

        Should(event).should.not.have.property('n');

        done();
    });

    it('should invoke forwarder opt out', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        mockForwarder.configure();
        mParticle.init(apiKey);
        mParticle.setOptOut(true);

        mockForwarder.instance.should.have.property('setOptOutCalled', true);

        done();
    });

    it('should invoke forwarder setuserattribute', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        mockForwarder.configure();
        mParticle.init(apiKey);
        mParticle.Identity.getCurrentUser().setUserAttribute('gender', 'male');

        mockForwarder.instance.should.have.property('setUserAttributeCalled', true);

        done();
    });

    it('should invoke forwarder setuserattribute when calling setUserAttributeList', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        mockForwarder.configure();
        mParticle.init(apiKey);
        mParticle.Identity.getCurrentUser().setUserAttributeList('gender', ['male']);

        mockForwarder.instance.should.have.property('setUserAttributeCalled', true);

        done();
    });

    it('should invoke forwarder removeuserattribute', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        mockForwarder.configure();
        mParticle.init(apiKey);
        mParticle.Identity.getCurrentUser().setUserAttribute('gender', 'male');
        mParticle.Identity.getCurrentUser().removeUserAttribute('gender');

        mockForwarder.instance.should.have.property('removeUserAttributeCalled', true);

        done();
    });

    it('should filter user attributes from forwarder on log event', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [mParticle.generateHash('gender')],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        });

        mParticle.init(apiKey);
        mParticle.Identity.getCurrentUser().setUserAttribute('gender', 'male');

        mParticle.logEvent('test event');

        var event = mockForwarder.instance.receivedEvent;
        event.should.have.property('UserAttributes');
        event.UserAttributes.should.not.have.property('gender');

        done();
    });

    it('should filter user identities from forwarder on init and bring customerid as first ID', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);

        mParticle.init(apiKey);

        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            pageViewFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [mParticle.IdentityType.Google],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        });

        mParticle.Identity.modify({userIdentities: {google: 'test@google.com', email: 'test@gmail.com', customerid: '123'}});
        mParticle.init(apiKey);

        mParticle.userIdentitiesFilterOnInitTest.length.should.equal(2);
        mParticle.userIdentitiesFilterOnInitTest[0].Type.should.equal(1);
        mParticle.userIdentitiesFilterOnInitTest[0].Identity.should.equal('123');
        mParticle.userIdentitiesFilterOnInitTest[1].Type.should.equal(7);
        mParticle.userIdentitiesFilterOnInitTest[1].Identity.should.equal('test@gmail.com');
        Should(mParticle.userIdentitiesFilterOnInitTest[2]).not.be.ok();

        done();
    });

    it('should filter user identities from forwarder on log event and bring customerid as first ID', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);

        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            pageViewFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [mParticle.IdentityType.Google],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        });
        mParticle.init(apiKey);

        mParticle.Identity.modify({userIdentities: {google: 'test@google.com', email: 'test@gmail.com', customerid: '123'}});
        mParticle.logEvent('test event');
        var event = mockForwarder.instance.receivedEvent;

        Object.keys(event.UserIdentities).length.should.equal(2);
        var googleUserIdentityExits = false;
        event.UserIdentities.forEach(function(identity) {
            if (identity.Type === mParticle.IdentityType.Google) {
                googleUserIdentityExits = true;
            }
        });
        Should(googleUserIdentityExits).not.be.ok();

        event.UserIdentities[0].Type.should.equal(mParticle.IdentityType.CustomerId);

        done();
    });

    it('should filter user attributes from forwarder on init, and on subsequent set attribute calls', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mParticle.init(apiKey);

        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            pageViewFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [Helpers.generateHash('gender'), Helpers.generateHash('age')],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        });
        mParticle.Identity.getCurrentUser().setUserAttribute('gender', 'male');
        mParticle.userAttributesFilterOnInitTest.should.not.have.property('gender');

        mParticle.init(apiKey);

        mParticle.Identity.getCurrentUser().setUserAttribute('age', 32);
        mParticle.Identity.getCurrentUser().setUserAttribute('weight', 150);

        mockForwarder.instance.userAttributes.should.have.property('weight', 150);
        mockForwarder.instance.userAttributes.should.not.have.property('age');

        done();
    });

    it('should filter event names', function(done) {
        mParticle.reset(MPConfig);

        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);

        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [mParticle.generateHash(mParticle.EventType.Navigation + 'test event')],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        });

        mParticle.init(apiKey);

        mParticle.startNewSession();
        mockForwarder.instance.receivedEvent = null;

        mParticle.logEvent('test event', mParticle.EventType.Navigation);

        Should(mockForwarder.instance.receivedEvent).not.be.ok();

        mParticle.logEvent('test event 2', mParticle.EventType.Navigation);

        Should(mockForwarder.instance.receivedEvent).be.ok();

        done();
    });

    it('should filter page event names', function(done) {
        mParticle.reset(MPConfig);

        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);

        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [mParticle.generateHash(mParticle.EventType.Unknown + 'PageView')],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        });

        mParticle.init(apiKey);

        mParticle.startNewSession();
        mockForwarder.instance.receivedEvent = null;

        mParticle.logPageView();

        Should(mockForwarder.instance.receivedEvent).not.be.ok();

        done();
    });

    it('should filter event attributes', function(done) {
        mParticle.reset(MPConfig);

        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);

        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [mParticle.generateHash(mParticle.EventType.Navigation + 'test event' + 'test attribute')],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        });

        mParticle.init(apiKey);

        mParticle.logEvent('test event', mParticle.EventType.Navigation, {
            'test attribute': 'test value',
            'test attribute 2': 'test value 2'
        });

        var event = mockForwarder.instance.receivedEvent;

        event.EventAttributes.should.not.have.property('test attribute');
        event.EventAttributes.should.have.property('test attribute 2');

        done();
    });

    it('should filter page event attributes', function(done) {
        mParticle.reset(MPConfig);

        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);

        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [mParticle.generateHash(mParticle.EventType.Navigation + 'test event' + 'test attribute')],
            screenNameFilters: [],
            pageViewAttributeFilters: [mParticle.generateHash(mParticle.EventType.Unknown + 'PageView' + 'hostname')],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        });

        mParticle.init(apiKey);

        mParticle.logPageView();

        var event = mockForwarder.instance.receivedEvent;

        event.EventAttributes.should.not.have.property('hostname');
        event.EventAttributes.should.have.property('title');

        done();
    });

    it('should call logout on forwarder', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mockForwarder.configure();

        mParticle.init(apiKey);
        mParticle.Identity.logout();

        mockForwarder.instance.should.have.property('logOutCalled', true);

        done();
    });

    it('should pass in app name to forwarder on initialize', function(done) {
        mParticle.config.appName = 'Unit Tests';
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mockForwarder.configure();

        mParticle.init(apiKey);

        mockForwarder.instance.should.have.property('appName', 'Unit Tests');

        done();
    });

    it('should pass in app version to forwarder on initialize', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mockForwarder.configure();

        mParticle.config.appVersion = '3.0';
        mParticle.init(apiKey);

        mockForwarder.instance.should.have.property('appVersion', '3.0');

        done();
    });

    it('should pass in user identities to forwarder on initialize', function(done) {
        mParticle.reset(MPConfig);

        setLocalStorage();

        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        mockForwarder.configure();
        mParticle.init(apiKey);

        Object.keys(mockForwarder.instance.userIdentities).length.should.equal(1);

        done();
    });

    it('should pass in user attributes to forwarder on initialize', function(done) {
        mParticle.reset(MPConfig);

        setLocalStorage();

        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);
        mockForwarder.configure();
        mParticle.init(apiKey);

        mockForwarder.instance.should.have.property('userAttributes');
        mockForwarder.instance.userAttributes.should.have.property('color', 'blue');

        window.mParticle.identifyRequest = {};

        done();
    });

    it('should not forward event if attribute forwarding rule is set', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);

        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true,
            filteringEventAttributeValue: {
                eventAttributeName: mParticle.generateHash('ForwardingRule').toString(),
                eventAttributeValue: mParticle.generateHash('Forward').toString(),
                includeOnMatch: false
            }
        });

        mParticle.init(apiKey);

        mParticle.logEvent('send this event to forwarder', mParticle.EventType.Navigation, {
            ForwardingRule: 'Forward'
        });

        var event = mockForwarder.instance.receivedEvent;

        event.should.not.have.property('EventName', 'send this event to forwarder');

        done();
    });

    it('should forward event if event attribute forwarding rule is set and includeOnMatch is true', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);

        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true,
            filteringEventAttributeValue: {
                eventAttributeName: mParticle.generateHash('ForwardingRule').toString(),
                eventAttributeValue: mParticle.generateHash('Forward').toString(),
                includeOnMatch: true
            }
        });

        mParticle.init(apiKey);

        mParticle.logEvent('send this event to forwarder', mParticle.EventType.Navigation, {
            ForwardingRule: 'Forward'
        });

        var event = mockForwarder.instance.receivedEvent;

        event.should.have.property('EventName', 'send this event to forwarder');

        done();
    });

    it('should forward event if event attribute forwarding rule is set and includeOnMatch is true but attributes do not match', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);

        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true,
            filteringEventAttributeValue: {
                eventAttributeName: mParticle.generateHash('ForwardingRule').toString(),
                eventAttributeValue: mParticle.generateHash('Forward').toString(),
                includeOnMatch: true
            }
        });

        mParticle.init(apiKey);

        mParticle.logEvent('send this event to forwarder', mParticle.EventType.Navigation, {
            Test: 'Non-Matching'
        });

        var event = mockForwarder.instance.receivedEvent;

        event.should.not.have.property('EventName', 'send this event to forwarder');

        done();
    });

    it('should not forward event if event attribute forwarding rule is set and includeOnMatch is false', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);

        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true,
            filteringEventAttributeValue: {
                eventAttributeName: mParticle.generateHash('ForwardingRule').toString(),
                eventAttributeValue: mParticle.generateHash('Forward').toString(),
                includeOnMatch: false
            }
        });

        mParticle.init(apiKey);

        mockForwarder.instance.receivedEvent.EventName.should.equal(1);
        mockForwarder.instance.receivedEvent = null;

        mParticle.logEvent('send this event to forwarder', mParticle.EventType.Navigation, {
            ForwardingRule: 'Forward'
        });

        var event = mockForwarder.instance.receivedEvent;

        Should(event).not.be.ok();

        done();
    });

    it('should forward event if event attribute forwarding rule is set and includeOnMatch is false but attributes do not match', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();
        mParticle.addForwarder(mockForwarder);

        mParticle.configureForwarder({
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true,
            filteringEventAttributeValue: {
                eventAttributeName: mParticle.generateHash('ForwardingRule').toString(),
                eventAttributeValue: mParticle.generateHash('Forward').toString(),
                includeOnMatch: false
            }
        });

        mParticle.init(apiKey);

        mockForwarder.instance.receivedEvent.EventName.should.equal(1);
        mockForwarder.instance.receivedEvent = null;

        mParticle.logEvent('send this event to forwarder', mParticle.EventType.Navigation, {
            Test: 'does not match'
        });

        var event = mockForwarder.instance.receivedEvent;

        event.should.have.property('EventName', 'send this event to forwarder');

        done();
    });

    it('should send event to forwarder if filtering attribute and includingOnMatch is true', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        var filteringUserAttributeValue = {
            userAttributeName: mParticle.generateHash('gender').toString(),
            userAttributeValue: mParticle.generateHash('male').toString(),
            includeOnMatch: true
        };

        var forwarder = {
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        };

        forwarder.filteringUserAttributeValue = filteringUserAttributeValue;

        mParticle.configureForwarder(forwarder);

        mParticle.init(apiKey);

        mParticle.Identity.getCurrentUser().setUserAttribute('Gender', 'Male');

        mParticle.logEvent('test event');

        var event = mockForwarder.instance.receivedEvent;
        event.should.have.property('UserAttributes');
        event.UserAttributes.should.have.property('Gender', 'Male');
        event.EventName.should.equal('test event');

        done();
    });

    it('should not send event to forwarder if filtering attribute and includingOnMatch is false', function(done) {
        mParticle.reset(MPConfig);

        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        var filteringUserAttributeValue = {
            userAttributeName: mParticle.generateHash('gender').toString(),
            userAttributeValue: mParticle.generateHash('male').toString(),
            includeOnMatch: false
        };

        var forwarder = {
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        };

        forwarder.filteringUserAttributeValue = filteringUserAttributeValue;

        mParticle.configureForwarder(forwarder);

        mParticle.init(apiKey);

        mParticle.Identity.getCurrentUser().setUserAttribute('Gender', 'Male');
        //reset received event, which will have the initial session start event on it
        mockForwarder.instance.receivedEvent = null;

        mParticle.logEvent('test event');
        var event = mockForwarder.instance.receivedEvent;

        Should(event).not.be.ok();

        done();
    });

    it('should permit forwarder if no user attribute value filters configured', function(done) {
        var enabled = Forwarders.isEnabledForUserAttributes(null, null);
        enabled.should.be.ok();

        enabled = Forwarders.isEnabledForUserAttributes({}, null);
        enabled.should.be.ok();
        done();
    });

    it('should send event to forwarder if there are no user attributes on event if includeOnMatch = false', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        var filteringUserAttributeValue = {
            userAttributeName: mParticle.generateHash('gender').toString(),
            userAttributeValue: mParticle.generateHash('male').toString(),
            includeOnMatch: false
        };

        var forwarder = {
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        };

        forwarder.filteringUserAttributeValue = filteringUserAttributeValue;

        mParticle.configureForwarder(forwarder);

        mParticle.init(apiKey);

        mParticle.logEvent('test event');

        var event = mockForwarder.instance.receivedEvent;
        mockForwarder.instance.receivedEvent.EventName.should.equal('test event');
        Should(event).be.ok();

        done();
    });

    it('should not send event to forwarder if there are no user attributes on event if includeOnMatch = true', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        var filteringUserAttributeValue = {
            userAttributeName: mParticle.generateHash('gender').toString(),
            userAttributeValue: mParticle.generateHash('male').toString(),
            includeOnMatch: true
        };

        var forwarder = {
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        };

        forwarder.filteringUserAttributeValue = filteringUserAttributeValue;

        mParticle.configureForwarder(forwarder);

        mParticle.init(apiKey);

        mParticle.logEvent('test event');

        var event = mockForwarder.instance.receivedEvent;
        Should(event).not.be.ok();

        done();
    });

    it('should send event to forwarder if there is no match and includeOnMatch = false', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        var filteringUserAttributeValue = {
            userAttributeName: mParticle.generateHash('gender').toString(),
            userAttributeValue: mParticle.generateHash('male').toString(),
            includeOnMatch: false
        };

        var forwarder = {
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        };

        forwarder.filteringUserAttributeValue = filteringUserAttributeValue;

        mParticle.configureForwarder(forwarder);

        mParticle.init(apiKey);
        mParticle.Identity.getCurrentUser().setUserAttribute('gender', 'female');
        mParticle.logEvent('test event');

        var event = mockForwarder.instance.receivedEvent;
        Should(event).be.ok();
        event.EventName.should.equal('test event');

        done();
    });

    it('should not send event to forwarder if there is no match and includeOnMatch = true', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        var filteringUserAttributeValue = {
            userAttributeName: mParticle.generateHash('gender').toString(),
            userAttributeValue: mParticle.generateHash('male').toString(),
            includeOnMatch: true
        };

        var forwarder = {
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        };

        forwarder.filteringUserAttributeValue = filteringUserAttributeValue;

        mParticle.configureForwarder(forwarder);

        mParticle.init(apiKey);
        mParticle.Identity.getCurrentUser().setUserAttribute('gender', 'female');
        mParticle.logEvent('test event');

        var event = mockForwarder.instance.receivedEvent;
        Should(event).not.be.ok();

        done();
    });

    it('should reinitialize forwarders when user attribute changes', function(done) {
        mParticle.reset(MPConfig);

        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        var filteringUserAttributeValue = {
            userAttributeName: mParticle.generateHash('gender').toString(),
            userAttributeValue: mParticle.generateHash('male').toString(),
            includeOnMatch: false
        };

        var forwarder = {
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        };

        forwarder.filteringUserAttributeValue = filteringUserAttributeValue;

        mParticle.configureForwarder(forwarder);

        mParticle.init(apiKey);

        mParticle.Identity.getCurrentUser().setUserAttribute('Gender', 'Male');

        var activeForwarders = mParticle._getActiveForwarders();
        activeForwarders.length.should.equal(0);

        mockForwarder.instance.receivedEvent = null;

        mParticle.logEvent('test event');
        var event = mockForwarder.instance.receivedEvent;

        Should(event).not.be.ok();

        mParticle.Identity.getCurrentUser().setUserAttribute('Gender', 'famale');

        activeForwarders = mParticle._getActiveForwarders();
        activeForwarders.length.should.equal(1);

        mockForwarder.instance.receivedEvent = null;

        mParticle.logEvent('test event');
        event = mockForwarder.instance.receivedEvent;

        Should(event).be.ok();

        done();
    });

    it('should send event to forwarder if the filterinUserAttribute object is invalid', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);
        var filteringUserAttributeValue = undefined;

        var forwarder = {
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        };

        forwarder.filteringUserAttributeValue = filteringUserAttributeValue;

        mParticle.configureForwarder(forwarder);

        mParticle.init(apiKey);
        mParticle.Identity.getCurrentUser().setUserAttribute('Gender', 'Male');

        mParticle.logEvent('test event');
        var event = mockForwarder.instance.receivedEvent;

        Should(event).be.ok();
        mockForwarder.instance.receivedEvent.EventName.should.equal('test event');

        done();
    });

    it('should call forwarder onUserIdentified method when identity is returned', function(done) {
        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);

        var forwarder = {
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        };

        mParticle.configureForwarder(forwarder);

        mParticle.init(apiKey);

        mockForwarder.instance.should.have.property('onUserIdentifiedCalled', true);

        done();
    });

    it('should queue forwarder stats reporting and send after 5 seconds if batching feature is true', function(done) {
        var clock = sinon.useFakeTimers();

        mParticle.reset(MPConfig);
        var mockForwarder = new MockForwarder();

        mParticle.addForwarder(mockForwarder);

        var forwarder = {
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true
        };

        mParticle.configureForwarder(forwarder);
        mParticle._configureFeatures({batching: true});

        mParticle.init(apiKey);
        mParticle.logEvent('not in forwarder');
        var product = mParticle.eCommerce.createProduct('iphone', 'sku', 123, 1);
        mParticle.eCommerce.Cart.add(product, true);

        var result = getForwarderEvent('not in forwarder');

        Should(result).not.be.ok();
        clock.tick(5001);

        result = getForwarderEvent('not in forwarder');
        result.should.be.ok();
        result = getForwarderEvent('eCommerce - AddToCart');
        result.should.be.ok();
        clock.restore();

        done();
    });

    it('should initialize forwarders when a user is not logged in and excludeAnonymousUser=false', function(done) {
        mParticle.reset(MPConfig);

        var mockForwarder = new MockForwarder();
        var mockForwarder2 = new MockForwarder('MockForwarder2', 2);

        mParticle.addForwarder(mockForwarder);
        mParticle.addForwarder(mockForwarder2);

        var forwarder = {
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true,
            excludeAnonymousUser: false
        };

        mParticle.configureForwarder(forwarder);

        forwarder.name = 'MockForwarder2';
        forwarder.moduleId = 2;
        forwarder.excludeAnonymousUser = true;
        mParticle.configureForwarder(forwarder);

        server.handle = function(request) {
            request.setResponseHeader('Content-Type', 'application/json');
            request.receive(200, JSON.stringify({
                is_logged_in: false,
                mpid: 'MPID1'
            }));
        };

        mParticle.init(apiKey);

        var activeForwarders = mParticle._getActiveForwarders();

        activeForwarders.length.should.equal(1);
        mParticle.Identity.getCurrentUser().isLoggedIn().should.equal(false);

        done();
    });

    it('should initialize forwarders with excludeUnknowknUser = true foro non-logged-in users', function(done) {
        mParticle.reset(MPConfig);

        var mockForwarder = new MockForwarder();
        var mockForwarder2 = new MockForwarder('MockForwarder2', 2);
        mParticle.addForwarder(mockForwarder);
        mParticle.addForwarder(mockForwarder2);

        var forwarder = {
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true,
            excludeAnonymousUser: true
        };
        mParticle.configureForwarder(forwarder);
        forwarder.name = 'MockForwarder2';
        forwarder.moduleId = 2;
        forwarder.excludeAnonymousUser = false;
        mParticle.configureForwarder(forwarder);

        server.handle = function(request) {
            request.setResponseHeader('Content-Type', 'application/json');
            request.receive(200, JSON.stringify({
                is_logged_in: false,
                mpid: 'MPID1'
            }));
        };

        mParticle.init(apiKey);

        var activeForwarders = mParticle._getActiveForwarders();

        activeForwarders.length.should.equal(1);
        mParticle.Identity.getCurrentUser().isLoggedIn().should.equal(false);

        done();
    });

    it('should initialize all forwarders when a user is logged in and the page reloads', function(done) {
        mParticle.reset(MPConfig);

        var mockForwarder = new MockForwarder();
        var mockForwarder2 = new MockForwarder('MockForwarder2', 2);

        mParticle.addForwarder(mockForwarder);
        mParticle.addForwarder(mockForwarder2);

        var forwarder = {
            name: 'MockForwarder',
            settings: {},
            eventNameFilters: [],
            eventTypeFilters: [],
            attributeFilters: [],
            screenNameFilters: [],
            pageViewAttributeFilters: [],
            userIdentityFilters: [],
            userAttributeFilters: [],
            moduleId: 1,
            isDebug: false,
            HasDebugString: 'false',
            isVisible: true,
            excludeAnonymousUser: false
        };

        mParticle.configureForwarder(forwarder);

        forwarder.name = 'MockForwarder2';
        forwarder.moduleId = 2;
        forwarder.excludeAnonymousUser = true;
        mParticle.configureForwarder(forwarder);

        server.handle = function(request) {
            request.setResponseHeader('Content-Type', 'application/json');
            request.receive(200, JSON.stringify({
                is_logged_in: false,
                mpid: 'MPID1'
            }));
        };

        mParticle.init(apiKey);
        mParticle.Identity.getCurrentUser().isLoggedIn().should.equal(false);
        var user = {
            userIdentities: {
                customerid: 'customerid3',
                email: 'email3@test.com'
            }
        };

        server.handle = function(request) {
            request.setResponseHeader('Content-Type', 'application/json');
            request.receive(200, JSON.stringify({
                is_logged_in: true,
                mpid: 'MPID2'
            }));
        };

        mParticle.Identity.login(user);
        mParticle.Identity.getCurrentUser().isLoggedIn().should.equal(true);
        var activeForwarders = mParticle._getActiveForwarders();
        activeForwarders.length.should.equal(2);

        mParticle.init(apiKey);
        mParticle.Identity.getCurrentUser().isLoggedIn().should.equal(true);
        var activeForwarders2 = mParticle._getActiveForwarders();
        activeForwarders2.length.should.equal(2);

        done();
    });

    it('should save logged in status of most recent user to cookies when logged in', function(done) {
        mParticle.reset(MPConfig);

        server.handle = function(request) {
            request.setResponseHeader('Content-Type', 'application/json');
            request.receive(200, JSON.stringify({
                is_logged_in: true,
                mpid: 'MPID1'
            }));
        };

        mParticle.init(apiKey);
        var ls = mParticle.persistence.getLocalStorage();
        ls.l.should.equal(true);


        mParticle.init(apiKey);
        var ls2 = mParticle.persistence.getLocalStorage();
        ls2.hasOwnProperty('l').should.equal(true);

        server.handle = function(request) {
            request.setResponseHeader('Content-Type', 'application/json');
            request.receive(200, JSON.stringify({
                is_logged_in: false,
                mpid: 'MPID1'
            }));
        };

        mParticle.Identity.logout();
        var ls3 = mParticle.persistence.getLocalStorage();
        ls3.l.should.equal(false);

        mParticle.init(apiKey);
        var ls4 = mParticle.persistence.getLocalStorage();
        ls4.l.should.equal(false);

        done();
    });

    it('should not set integration attributes on forwarders when a non-object attr is passed', function(done) {
        mParticle.setIntegrationAttribute(128, 123);
        var adobeIntegrationAttributes = mParticle.getIntegrationAttributes(128);
        Object.keys(adobeIntegrationAttributes).length.should.equal(0);

        done();
    });

    it('should set integration attributes on forwarders', function(done) {
        mParticle.setIntegrationAttribute(128, {MCID: 'abcdefg'});
        var adobeIntegrationAttributes = mParticle.getIntegrationAttributes(128);

        adobeIntegrationAttributes.MCID.should.equal('abcdefg');

        done();
    });

    it('should clear integration attributes when an empty object or a null is passed', function(done) {
        mParticle.setIntegrationAttribute(128, {MCID: 'abcdefg'});
        var adobeIntegrationAttributes = mParticle.getIntegrationAttributes(128);
        Object.keys(adobeIntegrationAttributes).length.should.equal(1);

        mParticle.setIntegrationAttribute(128, {});
        adobeIntegrationAttributes = mParticle.getIntegrationAttributes(128);
        Object.keys(adobeIntegrationAttributes).length.should.equal(0);

        mParticle.setIntegrationAttribute(128, {MCID: 'abcdefg'});
        adobeIntegrationAttributes = mParticle.getIntegrationAttributes(128);
        Object.keys(adobeIntegrationAttributes).length.should.equal(1);

        mParticle.setIntegrationAttribute(128, null);
        adobeIntegrationAttributes = mParticle.getIntegrationAttributes(128);
        Object.keys(adobeIntegrationAttributes).length.should.equal(0);

        done();
    });

    it('should set only strings as integration attributes', function(done) {
        mParticle.setIntegrationAttribute(128, {
            MCID: 'abcdefg',
            fail: {test: 'false'},
            nullValue: null,
            undefinedValue: undefined
        });
        var adobeIntegrationAttributes = mParticle.getIntegrationAttributes(128);
        Object.keys(adobeIntegrationAttributes).length.should.equal(1);

        done();
    });

    it('should add integration delays to the integrationDelays object', function(done) {
        mParticle._setIntegrationDelay(128, true);
        mParticle._setIntegrationDelay(24, false);
        mParticle._setIntegrationDelay(10, true);

        var integrationDelays = mParticle._getIntegrationDelays();

        integrationDelays.should.have.property('128', true);
        integrationDelays.should.have.property('24', false);
        integrationDelays.should.have.property('10', true);

        done();
    });

    it('integration test - should not log events if there are any integrations delaying, then resume logging events once delays are gone', function(done) {
        mParticle.reset(MPConfig);
        // this code will be put in each forwarder as each forwarder is initialized
        mParticle._setIntegrationDelay(128, true);
        mParticle._setIntegrationDelay(24, false);
        mParticle._setIntegrationDelay(10, true);

        mParticle.init(apiKey);
        server.requests = [];
        mParticle.logEvent('test1');
        server.requests.length.should.equal(0);

        mParticle._setIntegrationDelay(10, false);
        mParticle._setIntegrationDelay(128, false);
        mParticle.logEvent('test2');
        server.requests.length.should.equal(4);
        var sessionStartEvent = getEvent(1);
        var astEvent = getEvent(10);
        var test1 = getEvent('test1');
        var test2 = getEvent('test2');

        (typeof sessionStartEvent === 'object').should.equal(true);
        (typeof astEvent === 'object').should.equal(true);
        (typeof test1 === 'object').should.equal(true);
        (typeof test2 === 'object').should.equal(true);

        done();
    });

    it('integration test - should send events after a configured delay, or 5 seconds by default if setIntegrationDelays are still true', function(done) {
        // testing default of 5000 ms
        var clock = sinon.useFakeTimers();
        mParticle.reset(MPConfig);
        // this code will be put in each forwarder as each forwarder is initialized
        mParticle._setIntegrationDelay(128, true);
        Should(Object.keys(mParticle.preInit.integrationDelays).length).equal(1);
        mParticle._setIntegrationDelay(24, false);
        Should(Object.keys(mParticle.preInit.integrationDelays).length).equal(2);
        mParticle._setIntegrationDelay(10, true);
        Should(Object.keys(mParticle.preInit.integrationDelays).length).equal(3);
        mParticle.init(apiKey);
        server.requests = [];
        mParticle.logEvent('test1');
        server.requests.length.should.equal(0);

        clock.tick(5001);

        mParticle.logEvent('test2');
        server.requests.length.should.equal(4);
        var sessionStartEvent = getEvent(1);
        var astEvent = getEvent(10);
        var test1 = getEvent('test1');
        var test2 = getEvent('test2');

        (typeof sessionStartEvent === 'object').should.equal(true);
        (typeof astEvent === 'object').should.equal(true);
        (typeof test1 === 'object').should.equal(true);
        (typeof test2 === 'object').should.equal(true);
        clock.restore();

        // testing user-configured integrationDelayTimeout
        clock = sinon.useFakeTimers();
        mParticle.reset(MPConfig);
        mParticle.config.integrationDelayTimeout = 1000;
        mParticle._setIntegrationDelay(128, true);
        mParticle._setIntegrationDelay(24, false);
        mParticle._setIntegrationDelay(10, true);
        mParticle.init(apiKey);
        server.requests = [];
        mParticle.logEvent('test1');
        server.requests.length.should.equal(0);

        clock.tick(1001);

        mParticle.logEvent('test2');
        server.requests.length.should.equal(4);
        sessionStartEvent = getEvent(1);
        astEvent = getEvent(10);
        test1 = getEvent('test1');
        test2 = getEvent('test2');

        (typeof sessionStartEvent === 'object').should.equal(true);
        (typeof astEvent === 'object').should.equal(true);
        (typeof test1 === 'object').should.equal(true);
        (typeof test2 === 'object').should.equal(true);
        clock.restore();
        

        done();
    });
});
