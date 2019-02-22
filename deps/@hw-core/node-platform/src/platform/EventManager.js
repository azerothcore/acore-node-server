import {
    EventEmitter
} from "events"

export const EventType = type => Symbol(type)

/**
 * List of events available for {EventManager}
 */
export const Events = Object.freeze({
    before_init: EventType("before_init"),
    after_init: EventType("after_init"),
    before_apollo_init: EventType("before_apollo_init"),
    after_apollo_init: EventType("after_apollo_init"),
    before_server_start: EventType("before_server_start"),
    after_server_start: EventType("after_server_start"),
});



/**
 * EventManager for node-platform, you can extend it to create your own EventManager
 */
export class EventManager extends EventEmitter {
    constructor(events, name = "node-platform") {
        super();

        this.events = events;
        this.name = name;
        Object.freeze(this.name); // avoid changing EventManager name
    }

    /**
     * 
     * @param {EventType[]} event 
     * @param  {...any} args 
     * @returns {EventManager}
     */
    emit(event, ...args) {
        const evtName=event.toString().slice(7,-1) // remove "Symbol()" from description
        if (!this.events[evtName] || this.events[evtName] != event) {
            throw new Error("EventManager (" + this.name + ") have no event: " + evtName)
        }

        super.emit(event, ...args)
        return this;
    }

    /**
      @callback listenerCb
      @param {...Object} args
    */
    /**
     * 
     * @param {EventType[]} event 
     * @param {listenerCb} listener 
     * @returns {EventManager}
     */
    on(event, listener) {
        const evtName=event.toString().slice(7,-1) // remove "Symbol()" from description
        if (!this.events[evtName] || this.events[evtName] != event) {
            throw new Error("EventManager (" + this.name + ") have no event: " + evtName)
        }

        super.on(event, listener)
        return this;
    }
}

/**@type {EventManager} singleton instance of EventManager */
export const sEvtMgr = new EventManager(Events);
