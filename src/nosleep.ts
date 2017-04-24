/**
 * based on
 * NoSleep.js v0.5.0 - git.io/vfn01
 * Rich Tibbett
 * MIT license
 */
export default class NoSleep {

    // UA matching
    static ua = {
        Android: /Android/ig.test(navigator.userAgent),
        iOS: /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent)
    };
    //noinspection TsLint
    static media = {
        WebM: 'data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQ' +
        'oeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACEC' +
        'PQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBA' +
        'eBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA=',
        MP4: 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAh' +
        'mcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8J' +
        'bCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAA' +
        'AAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAA' +
        'Fx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAA' +
        'AAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZ' +
        'AAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAA' +
        'AAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZ' +
        'gAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAE' +
        'AAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAA' +
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDw' +
        'gEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2Y' +
        'zUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAA' +
        'AAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAA' +
        'GB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAA' +
        'AK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw=='
    };

    noSleepVideo: HTMLVideoElement;
    private noSleepTimer: number | null;

    static addSourceToVideo(element: HTMLVideoElement, type: string, dataURI: string) {
        const source = document.createElement('source');
        source.src = dataURI;
        source.type = 'video/' + type;
        element.appendChild(source);
    }

    // NoSleep instance constructor
    constructor() {
        if (NoSleep.ua.iOS) {
            this.noSleepTimer = null;
        } else if (NoSleep.ua.Android) {
            // Set up no sleep video element
            this.noSleepVideo = document.createElement('video');
            this.noSleepVideo.setAttribute('loop', '');

            // Append nosleep video sources
            NoSleep.addSourceToVideo(this.noSleepVideo, 'webm', NoSleep.media.WebM);
            NoSleep.addSourceToVideo(this.noSleepVideo, 'mp4', NoSleep.media.MP4);
        }
    };

    // Enable NoSleep instance
    enable(duration?: number) {
        if (NoSleep.ua.iOS) {
            this.disable();
            this.noSleepTimer = window.setInterval(
                function () {
                    window.location.href = window.location.href;
                    window.setTimeout(window.stop, 0);
                },
                (duration || 15000));
        } else if (NoSleep.ua.Android) {
            this.noSleepVideo.play();
        }
    };

    // Disable NoSleep instance
    disable() {
        if (NoSleep.ua.iOS) {
            if (this.noSleepTimer) {
                window.clearInterval(this.noSleepTimer);
                this.noSleepTimer = null;
            }
        } else if (NoSleep.ua.Android) {
            this.noSleepVideo.pause();
        }
    };
}