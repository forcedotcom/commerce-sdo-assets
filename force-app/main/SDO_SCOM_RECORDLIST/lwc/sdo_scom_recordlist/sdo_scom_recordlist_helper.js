import { LightningElement } from 'lwc';
import {ShowToastEvent} from "lightning/platformShowToastEvent";
/**
 * A basic pub-sub mechanism for sibling component communication
 *
 * TODO - adopt standard flexipage sibling communication mechanism when it's available.
 */
/*
        ! To store all the JS functions for the various LWC
        * This JavaScript file is used to provide many reusability functionality like pubsub 
        * Reusable Apex Calls to Server, Preparing Dynamic Toasts
        Todo : PubSub JS file of LWC &amp; Aura Components
        ? V2
*/
const events = {};
const samePageRef = (pageRef1, pageRef2) => {
    const obj1 = pageRef1.attributes;
    const obj2 = pageRef2.attributes;
    return Object.keys(obj1)
        .concat(Object.keys(obj2))
        .every(key => {
            return obj1[key] === obj2[key];
        });
};
/**
 * Registers a callback for an event
 * @param {string} eventName - Name of the event to listen for.
 * @param {function} callback - Function to invoke when said event is fired.
 * @param {object} thisArg - The value to be passed as the this parameter to the callback function is bound.
 */
const registerListener = (eventName, callback, thisArg) => {
    // Checking that the listener has a pageRef property. We rely on that property for filtering purpose in fireEvent()
    if (!thisArg.pageRef) {
        throw new Error(
            'pubsub listeners need a "@wire(CurrentPageReference) pageRef" property'
        );
    }

    if (!events[eventName]) {
        events[eventName] = [];
    }
    const duplicate = events[eventName].find(listener => {
        return listener.callback === callback && listener.thisArg === thisArg;
    });
    if (!duplicate) {
        events[eventName].push({ callback, thisArg });
    }
};
/**
 * Unregisters a callback for an event
 * @param {string} eventName - Name of the event to unregister from.
 * @param {function} callback - Function to unregister.
 * @param {object} thisArg - The value to be passed as the this parameter to the callback function is bound.
 */
const unregisterListener = (eventName, callback, thisArg) => {
    if (events[eventName]) {
        events[eventName] = events[eventName].filter(
            listener =>
                listener.callback !== callback || listener.thisArg !== thisArg
        );
    }
};
/**
 * Unregisters all event listeners bound to an object.
 * @param {object} thisArg - All the callbacks bound to this object will be removed.
 */
const unregisterAllListeners = thisArg => {
    Object.keys(events).forEach(eventName => {
        events[eventName] = events[eventName].filter(
            listener => listener.thisArg !== thisArg
        );
    });
};
/**
 * Fires an event to listeners.
 * @param {object} pageRef - Reference of the page that represents the event scope.
 * @param {string} eventName - Name of the event to fire.
 * @param {*} payload - Payload of the event to fire.
 */
const fireEvent = (pageRef, eventName, payload) => {
    if (events[eventName]) {
        const listeners = events[eventName];
        listeners.forEach(listener => {
            if (samePageRef(pageRef, listener.thisArg.pageRef)) {
                try {
                    listener.callback.call(listener.thisArg, payload);
                } catch (error) {
                    // fail silently
                }
            }
        });
    }
};
var callbacks = {};
/**
 * Todo: Calls an Apex Class method and send the response to call back methods.
 * @param {*} _serveraction     - Name of the apex class action needs to execute.
 * @param {*} _params           - the list of parameters in JSON format
 * @param {*} _onsuccess        - Name of the method which will execute in success response
 * @param {*} _onerror          - Name of the method which will execute in error response
 */
    const _servercall = (_serveraction, _params, _onsuccess, _onerror) => {
    if (!_params) {
        _params = {};
    }
    _serveraction(_params)
        .then(_result => {
            if (_result && _onsuccess) {
                if (_result.message == 'Success') {
                    _onsuccess(_isSuccessObject(_result));
                } else if (_result.message == 'Fail' || !_result.isSuccess) {
                    _onerror(_reduceErrors(_result.payload));
                }
            }
        })
        .catch(_error => {
            if (_error && _onerror) {
                _onerror(_reduceErrors(_error));
            }
        });
    };
    const _isSuccessObject = (_result) => {
        if (_result.payload != undefined && _result.message == 'Success') {
            var payload = JSON.parse(_result.payload);
            if (payload.lstDataTableRecs != undefined) {
                payload.lstDataTableRecs;
                return payload.lstDataTableRecs;
            }
        } else if (_result.message == 'Fail' || !_result.isSuccess) {
            return undefined;
        }
    };
    /**
     * Todo: Prepare the toast object and return back to the calling JS class
     * @param {String} _title     - title of of the toast message
     * @param {String} _message   - message to display to the user
     * @param {String} _variant   - toast type either success/error/warning or info
     * @param {String} _mode      - defines either toast should auto disappear or it should stick.
     */
    const _toastcall = (_title, _message, _variant, _mode) => {
        const _showToast = new ShowToastEvent({
            title: _title,
            message: JSON.stringify(_message),
            mode: _mode,
            variant: _variant
        });
        return _showToast;
    };

    /**
     * Todo: Parse the Error message and returns the parsed response to calling JS method.
     * @param {Array} errors  - Error Information
     */
    const _reduceErrors = errors => {
        if (!Array.isArray(errors)) {
            errors = [errors];
        }
        return errors
            .filter(error => !!error)
            .map(error => {
                if (Array.isArray(error.body)) {
                    return error.body.map(e => e.message);
                } else if (error.body && typeof error.body.message === "string") {
                    return error.body.message;
                } else if (typeof error.message === "string") {
                    return error.message;
                } else if (typeof error === "string") {
                    return error;
                }else if(error.body!=undefined){
                    return JSON.stringify(error.body);
                }
                return error.statusText;
            })
            .reduce((prev, curr) => prev.concat(curr), [])
            .filter(message => !!message);
    };
    const _isArrayEmpty = array => {
        if (array && array.length > 0) {
            return false
        }else{
            return true;
        }
    }
    const _isArrayEquals = (a, b) => {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    }
    const _getUniqueArray = array => {
        return [...new Set(array)];
    }
    const _hasDuplicates = array => {
        return (new Set(array)).size !== array.length;
    }
export {
    registerListener,
    unregisterListener,
    unregisterAllListeners,
    fireEvent,
    _servercall,
    _toastcall,
    _reduceErrors,
    _isArrayEmpty,
    _isArrayEquals,
    _getUniqueArray,
    _hasDuplicates
};