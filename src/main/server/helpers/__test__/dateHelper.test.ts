import { addDaystoDate, formatDateTime, getDatesBetween, getDayName, getFirstDayOfWeek, getMonthName, getMonths, getToday } from "../dateHelper";

describe('dateHelper', () => {
    it('adds correct days to date', () => {
        const add3Days = addDaystoDate(3, "2022-11-17");
        expect(add3Days).toEqual(new Date(2022, 10, 20));

    })

    it('crosses into next year if added to 31st december', () => {
        const add3Days = addDaystoDate(3, "2022-12-31");
        expect(add3Days).toEqual(new Date(2023, 0, 3));
    });

    //get first day of the week
    it('returns correct first day of 2022', () => {
        const firstDay = getFirstDayOfWeek(1, 2022);
        expect(firstDay).toBeInstanceOf(Date)
        expect(firstDay.getDate()).toEqual(26);//2021-12-26

        const firstDayOfLastWeek = getFirstDayOfWeek(53, 2022);
        expect(firstDayOfLastWeek.getDate()).toEqual(25);//2022-12-25
    });

    it('formats datetimes properly', () => {
        const datetime = "2022-11-22T12:41:00";
        const formatted = formatDateTime(datetime);
        expect(formatted).toEqual("2022-11-22 12:41:00");
        expect(formatted).not.toContain("T")
    })


    it('gets the correct date', () => {
        const testDate = new Date(2022, 1, 12);
        const formattedDate = getToday("", testDate);
        expect(formattedDate).toEqual("2022-02-12")

        const formattedMonth = getToday("month", testDate);
        expect(formattedMonth).toEqual("02")
    });

    it("gets the corect day name given the number", () => {
        //0 is sunday, saturday is 6
        expect(getDayName(0)).toEqual("Sunday");

        expect(getDayName(6)).toEqual("Saturday")
    });

    it("gets the corect month name given the number", () => {
        //1 is january, 12 is december
        
            expect(getMonthName(1)).toEqual("January");

        expect(getMonthName(12)).toEqual("December")


    });

    it("throws error when getMonthName called with invalid number", () => {
        // expect(getMonthName(17)).toEqual("December")

        expect(() => {
            getMonthName(15)
        }).toThrowError("Number not found")
    })

    it("gets the months in the correct order", () => {
        const months = getMonths();
        expect(months.length).toEqual(12);
        expect(months[0]).toEqual("January");
        expect(months[1]).toEqual("February");
        expect(months[2]).toEqual("March");
        expect(months[3]).toEqual("April");
        expect(months[4]).toEqual("May");
        expect(months[5]).toEqual("June");
        expect(months[6]).toEqual("July");
        expect(months[7]).toEqual("August");
        expect(months[8]).toEqual("September");
        expect(months[9]).toEqual("October");
        expect(months[10]).toEqual("November");
        expect(months[11]).toEqual("December");
    });

    it("gets the correct list of dates", () => {
        const datelist = getDatesBetween("2023-05-21", "2023-06-03");
        expect(datelist.length).toEqual(13);

        const datelist2 = getDatesBetween("2023-12-01", "2024-01-03");
        expect(datelist2.length).toEqual(34);
    });
})