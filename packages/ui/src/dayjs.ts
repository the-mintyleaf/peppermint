import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

/**
 * The shared dayjs instance, with the plugins consumers actually call already
 * registered.
 *
 * `relativeTime` backs `.fromNow()`, which several consumers use. dayjs ships
 * plugins opt-in, so a bare re-export leaves `.fromNow` undefined and the call
 * throws at runtime — and only on the code path that renders it, which is why it
 * survived. Extending here rather than in each app keeps a single registration
 * point and makes it impossible to import the un-extended instance from the
 * barrel.
 */
dayjs.extend(relativeTime);

export { dayjs };
