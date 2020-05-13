import {EventType, EventManager} from '@azerothcore/js-common';

/**
 * List of events available for {EventManager}
 */
export const Events = Object.freeze({
  dummy: EventType('dummy'),
});


/** @type {EventManager} singleton instance of EventManager */
export const sEvtMgr = new EventManager(Events, 'ServiceEvtMgr');


/*
sEvtMgr.on(Events.dummy, (url, data) => {

});*/
