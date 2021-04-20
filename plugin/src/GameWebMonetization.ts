/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @author       gammafp
 * @author       Dacio Romero (Web Monetization Event TypeScript Defs)
 * @copyright    2021 Photon Storm Ltd.
 */

import { EventEmitter } from 'eventemitter3';

/**
 * A Payment Configuration Object.
 *
 * @interface PaymentConfig
 * @field paymentPointer - Your payment account URL. The same value is used as the content in your <meta> tag.
 * @field pointerName - A friendly name for the `paymentPointer` if defined in the {@link PaymentConfig}.
 * @field weight - An optional weight to give the payment. A value between 0 and 100.
 */
export interface PaymentConfig
{
    paymentPointer: string;
    pointerName?: string;
    weight?: number;
}
 
export class GameWebMonetization extends EventEmitter
{
    /**
     * The event is emitted when monetization is started. Using this event you can determine if you
     * should display some extra benefits, or thanks, to the player.
     * 
     * See {@link MonetizationStartEvent} for the event properties.
     * 
     * @event
     * @example
     * ```js
     * // Receives
     * {
     *   paymentPointer: "$wallet.example.com/alice",
     *   requestId: ec4f9dec-0ba4-4029-8f6a-29dc21f2e0ce
     * }
     * ```
     */
    static START: string = 'start';

    /**
     * The event is emitted while web monetization is preparing to start to monetize your site.
     * 
     * @event
     * @type {object}
     * @property {string} paymentPointer - Your payment account URL. The same value is used as the content in your <meta> tag.
     * @property {string} requestId - This value is identical to the session ID/monetization ID (UUID v4) generated by the user agent (see Flow).
     * @example
     * ```js
     * // Receives
     * {
     *   paymentPointer: "$wallet.example.com/alice",
     *   requestId: ec4f9dec-0ba4-4029-8f6a-29dc21f2e0ce
     * }
     * ```
     */
    static PENDING: string = 'pending';

    /**
     * The event is emitted when the monetization is stopped.
     * 
     * @event
     * @type {object}
     * @property {string} paymentPointer - Your payment account URL. The same value is used as the content in your <meta> tag.
     * @property {string} requestId - This value is identical to the session ID/monetization ID (UUID v4) generated by the user agent (see Flow).
     * @property {boolean} finalized - When true, the monetization tag has been removed or the paymentPointer changed. No more events with this requestId expected.
     * @example
     * ```js
     * // Receives
     * {
     *   paymentPointer: "$wallet.example.com/alice",
     *   requestId: ec4f9dec-0ba4-4029-8f6a-29dc21f2e0ce,
     *   finalized: false
     * }
     * ```
     */
    static STOP: string = 'stop';

    /**
     * The event is emitted when the monetization progress.
     * 
     * The handler receives a {@link ProgressEvent} object.
     * 
     * @event
     * @typedef {object} ProgressEvent - Progress Event.
     * @property {string} paymentPointer - Your payment account URL. The same value is used as the content in your <meta> tag.
     * @property {string} requestId - This value is identical to the session ID/monetization ID (UUID v4) generated by the user agent (see Flow).
     * @property {string} amount - The destination amount received as specified in the Interledger protocol (ILP) packet.
     * @property {string} assetCode - The code (typically three characters) identifying the amount's unit. A unit, for example, could be a currency (USD, XRP).
     * @property {number} assetScale - The number of places past the decimal for the amount. For example, if you have USD with an asset scale of two, then the minimum divisible unit is cents.
     * @property {string} receipt - base64-encoded STREAM receipt issued by the Web Monetization receiver to the Web Monetization provider as proof of the total amount received in the stream.
     * @property {number} totalAmount - the sum of what has been received with the current paymentPointer, if the paymentPointer is changed this amount will be reset
     * @example
     * ```js
     * // Receives
     * {
     *   paymentPointer: "$wallet.example.com/alice",
     *   requestId: "ec4f9dec-0ba4-4029-8f6a-29dc21f2e0ce",
     *   amount: "7567",
     *   assetCode: "USD",
     *   assetScale: 2,
     *   receipt: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAPoAAAAAF5h2Mk=",
     *   totalAmount: 0.000328153
     * }
     * ```
     */
    static PROGRESS: string = 'progress';

    /**
     * Your payment account URL. The same value is used as the content in your <meta> tag.
     * 
     * @readonly
     */
    paymentPointer: string;

    /**
     * A friendly name for the `paymentPointer` if defined in the {@link PaymentConfig}.
     * 
     * @readonly
     */
    pointerName: string;

    /**
     * A running total of the amount of money streamed so far.
     */
    total: number = 0;

    /**
     * Is the Monetization Plugin active or not?
     * 
     * @readonly
     */
    isMonetized: boolean = false;

    /**
     * The current state of the Web Monetization Plugin.
     * 
     * The state can be `started`, `stopped` or `pending`.
     * 
     * @readonly
     */
    state: MonetizationState;

    /**
     * Creates an instance of the GameWebMonetization class.
     * 
     * @example
     * ```
     * new GameWebMonetization({
     *   paymentPointer: $ilp.uphold.com/zdXzL8aWJ4ii,
     *   pointerName: "Richard"
     * });
     * ```
     * 
     * If you want to divide your earnings you can use Probalistic Revenue Sharing.
     * The weight is necesary to know how have more opportunity to be selected each
     * time to game is started (this use Probalistic Revenue Sharing,
     * more information {@link https://webmonetization.org/docs/probabilistic-rev-sharing|HERE}
     * 
     * @example
     * ```
     * new GameWebMonetization([
     *   {
     *     paymentPointer: $ilp.uphold.com/zdXzL8aWJ4ii,
     *     pointerName: "Gamma",
     *     weight: 20
     *   },
     *   {
     *     paymentPointer: $ilp.uphold.com/zdXzL8aWJ4ii,
     *     pointerName: "Richard",
     *     weight: 80
     *   }
     * ]);
     * ```
     * @param config The Payment Configuration object, or an array of them.
     */
    constructor (config: PaymentConfig | PaymentConfig[])
    {
        super();

        this.changePaymentPointer(config);
        this.setState();
    }

    /**
     * Starts the Web Monetization process, creating the event listeners and
     * adding the `meta` tags to the document head.
     * 
     * @returns The GameWebMonetization instance.
     */
    start (): this
    {
        if (document && document.monetization)
        {
            this.addEvents();
            this.addMeta();
        }

        return this;
    }

    /**
     * Stops the Web Monetization process, removing the `meta` tags from the document head.
     * 
     * @returns The GameWebMonetization instance.
     */
    stop (): this
    {
        this.removeEvents();
        this.removeMeta();

        return this;
    }

    /**
     * Restarts the Web Monetization process by calling {@link stop} and then {@link start}.
     * 
     * @returns The GameWebMonetization instance.
     */
     restart (): this
     {
         this.stop();
         this.start();
 
         return this;
     }

    /**
     * Changes the active Payment Pointer to either the given config, or selects
     * randomly from an array of configs based on their `weight`.
     * 
     * If youy call this method _directly_ then you must make sure you also
     * call {@link restart} afterwards.
     *
     * @param config The Payment Configuration object, or an array of them.
     * @returns The GameWebMonetization instance.
     */
    changePaymentPointer (config: PaymentConfig | PaymentConfig[]): this
    {
        let paymentPointers: PaymentConfig[];

        if (!Array.isArray(config))
        {
            paymentPointers = [ { ...config, weight: 100 } ];
        }
        else
        {
            paymentPointers = config;
        }

        const paymentPointer = this.pickPointer(paymentPointers);

        if (paymentPointer !== undefined)
        {
            const pointerName = paymentPointers.find(pointer => {
                return pointer.paymentPointer === paymentPointer;
            }).pointerName;

            this.pointerName = pointerName;
        }

        this.setPaymentPointer(paymentPointer);

        return this;
    }

    /**
     * Internal method that sets the current Payment Pointer.
     *
     * @param paymentPointer Your payment account URL. The same value is used as the content in your <meta> tag.
     * @private
     */
    setPaymentPointer (paymentPointer: string): void
    {
        if (paymentPointer === undefined || paymentPointer === null || paymentPointer.trim() === '')
        {
            console.error('Invalid paymentPointer, please check your configuration');
        }

        this.paymentPointer = paymentPointer;
    }

    /**
     * Selects a random Payment Pointer based on the `weight` of those given.
     * 
     * @param pointers An array of Payment Configuration objects.
     * @returns A payment account URL. The same value is used as the content in your <meta> tag.
     * @private
     */
    pickPointer (pointers: PaymentConfig[]): string
    {
        const sum = Object.values(pointers).reduce((sum, pointers) => {
            const weight = pointers.weight;
            return sum + weight
        }, 0);

        let choice = Math.random() * sum;

        for (const pointer in pointers)
        {
            const weight = pointers[pointer].weight;

            if ((choice -= weight) <= 0)
            {
                return pointers[pointer].paymentPointer;
            }
        }
    }

    /**
     * The Start Event handler.
     * 
     * Sets the default start and emits the `GameWebMonetization.START` event.
     *
     * @param event The start event.
     * @fires GameWebMonetization.START
     * @private
     */
    onStart = (event: MonetizationStartEvent) =>
    {
        this.setState();

        this.isMonetized = true;

        this.emit(GameWebMonetization.START, event.detail);
    }

    /**
     * The Pending Event handler.
     * 
     * Emits the `GameWebMonetization.PENDING` event.
     *
     * @param event The pending event.
     * @fires GameWebMonetization.PENDING
     * @private
     */
    onPending = (event: MonetizationPendingEvent) =>
    {
        this.emit(GameWebMonetization.PENDING, event.detail);
    }

    /**
     * The Progress Event handler.
     * 
     * Updates the running `total` of streamed money and emits the {@link ProgressEvent} event.
     *
     * @param event The progress event.
     * @fires ProgressEvent
     * @private
     */
    onProgress = (event: MonetizationProgressEvent) =>
    {
        this.total += Number(event.detail.amount);

        const formatted = (this.total * Math.pow(10, -event.detail.assetScale)).toFixed(event.detail.assetScale);

        this.emit(GameWebMonetization.PROGRESS, { ...event.detail, 'totalAmount': formatted });
    }

    /**
     * The Stop Event handler.
     * 
     * Stops the state and emits the `GameWebMonetization.STOP` event.
     *
     * @param event The stop event.
     * @fires GameWebMonetization.STOP
     * @private
     */
    onStop = (event: MonetizationStopEvent) =>
    {
        if (this.state !== 'stopped')
        {
            this.setState();

            this.isMonetized = false;

            this.emit(GameWebMonetization.STOP, event.detail);
        }
    }

    /**
     * Sets listeners for all of the WebMonetization events.
     */
    addEvents ()
    {
        document.monetization.addEventListener('monetizationstart', this.onStart, false);
        document.monetization.addEventListener('monetizationpending', this.onPending, false);
        document.monetization.addEventListener('monetizationstop', this.onStop, false);
        document.monetization.addEventListener('monetizationprogress', this.onProgress, false);
    }

    /**
     * Removes listeners for all of the WebMonetization events.
     */
     removeEvents ()
     {
        document.monetization.removeEventListener('monetizationstart', this.onStart, false);
        document.monetization.removeEventListener('monetizationpending', this.onPending, false);
        document.monetization.removeEventListener('monetizationstop', this.onStop, false);
        document.monetization.removeEventListener('monetizationprogress', this.onProgress, false);
     }

    /**
     * Set the `state` property. See {@link MonetizationState}.
     * 
     * @private
     */
    setState (): void
    {
        if (document && document.monetization)
        {
            this.state = document.monetization.state;
        }
    }

    /**
     * Generates and inserts a monetization `meta` tag into the document header of the HTML
     * page this plugin is running on. If the meta tag already exists, it will be removed first.
     * 
     * This method is called automatically by {@link start}.
     */
    addMeta (): void
    {
        const checkMeta = document.querySelector('meta[name="monetization"]');
        const monetizationTag = document.createElement('meta');

        monetizationTag.setAttribute('name', 'monetization');
        monetizationTag.setAttribute('content', this.paymentPointer);

        if (this.state !== undefined)
        {
            if (checkMeta)
            {
                checkMeta.remove();
            }

            document.head.appendChild(monetizationTag);
        }
    }

    /**
     * Removes the monetization `meta` tag from the document header of the HTML
     * page this plugin is running on, if it exists. Also resets the running {@link total}.
     */
    removeMeta (): void
    {
        this.total = 0;

        const checkMeta = document.querySelector('meta[name="monetization"]');

        if (checkMeta)
        {
            checkMeta.remove();
        }
    }
}

interface BaseMonetizationEventDetail
{
    paymentPointer: string;
    requestId: string;
}
  
export interface MonetizationPendingEvent extends CustomEvent<BaseMonetizationEventDetail>
{
    type: 'monetizationpending';
}

/**
 * The Monetization Start Event.
 *
 * @typedef MonetizationStartEvent
 * @field paymentPointer - Your payment account URL. The same value is used as the content in your <meta> tag.
 * @field requestId - This value is identical to the session ID/monetization ID (UUID v4) generated by the user agent (see Flow).
 */
export interface MonetizationStartEvent extends CustomEvent<BaseMonetizationEventDetail>
{
    type: 'monetizationstart';
}

interface MonetizationStopEventDetail extends BaseMonetizationEventDetail
{
    finalized: boolean;
}

export interface MonetizationStopEvent extends CustomEvent<MonetizationStopEventDetail>
{
    type: 'monetizationstop';
}

interface MonetizationProgressEventDetail extends BaseMonetizationEventDetail
{
    amount: string;
    assetCode: string;
    assetScale: number;
}

export interface MonetizationProgressEvent extends CustomEvent<MonetizationProgressEventDetail>
{
    type: 'monetizationprogress';
}

export interface MonetizationEventMap
{
    monetizationpending: MonetizationPendingEvent;
    monetizationstart: MonetizationStartEvent;
    monetizationstop: MonetizationStopEvent;
    monetizationprogress: MonetizationProgressEvent;
}

export type MonetizationEvent = MonetizationEventMap[keyof MonetizationEventMap];

export type MonetizationState = 'stopped' | 'pending' | 'started';

type EventListener<T, E extends Event = Event> = (this: T, evt: E) => any;

interface EventListenerObject<T, E extends Event = Event>
{
    handleEvent(this: T, evt: E): void;
}

type EventListenerOrListenerObject<T, E extends Event = Event> = | EventListener<T, E> | EventListenerObject<T, E>;

export interface Monetization extends EventTarget
{
    state: MonetizationState;

    addEventListener<K extends keyof MonetizationEventMap>(
        type: K,
        listener: EventListenerOrListenerObject<Monetization, MonetizationEventMap[K]> | null,
        options?: boolean | AddEventListenerOptions
    ): void

    removeEventListener<K extends keyof MonetizationEventMap>(
        type: K,
        listener: EventListenerOrListenerObject<Monetization, MonetizationEventMap[K]> | null,
        options?: boolean | EventListenerOptions
    ): void
}

declare global {
    interface Document {
        monetization?: Monetization
    }
}
