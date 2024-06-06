class IMGData {
    constructor(filename, url, day, month, year, time, isVideo) {
        this.filename = filename;
        this.url = url;
        this.day = day;
        this.month = month;
        this.year = year;
        this.time = time;
        this.isVideo = isVideo;
    }
}

module.exports = IMGData;