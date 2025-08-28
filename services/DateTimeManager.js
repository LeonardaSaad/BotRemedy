class DateTimeManager {
    constructor() {
        this.date = null;
        this.time = null;
    }

    update() {
        const date = new Date();

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        this.date = `${year}-${month}-${day}`;

        this.time = date.toLocaleString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    }

    getDate() {
        this.update();
        return this.date;
    }

    getTime() {
        this.update();
        return this.time;
    }

    getCurrentDay() {
        const currentDay = this.getDate().slice(-2);
        return currentDay;
    }

    getDay(date) {
        const day = date.slice(-2);
        return day;
    }

    async awaitUntilNextDay() {
        return new Promise((resolve) => {
            const initialDate = this.getDate();

            console.log(
                `\x1b[34m[INFO - ${this.getTime()}]\x1b[0m Waiting for the next day. Today is: ${initialDate}`
            );

            const intervalId = setInterval(() => {
                this.update();
                const currentDate = this.getDate();

                if (currentDate !== initialDate) {
                    console.log(
                        `\x1b[34m[INFO - ${this.getTime()}]\x1b[0m Day changed! Today is: ${currentDate}`
                    );

                    clearInterval(intervalId);
                    resolve(true);
                }
            }, 60_000);
        });
    }
}

module.exports = { DateTimeManager };
