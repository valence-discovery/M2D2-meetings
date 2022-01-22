(function($) {

	"use strict";

	// Setup the calendar with the current date
$(document).ready(function(){
    var date = new Date();
    var today = date.getDate();
    // Set click handlers for DOM elements
    $(".right-button").click({date: date}, next_month);
    $(".left-button").click({date: date}, prev_month);
    $(".month").click({date: date}, month_click);
    // Set current month as active
    $(".months-row").children().eq(date.getMonth()).addClass("active-month");
    init_calendar(date);
    var events = check_events(today, date.getMonth()+1, date.getFullYear());
    show_events();
});

// Initialize the calendar by appending the HTML dates
function init_calendar(date) {
    $(".tbody").empty();
    $(".events-container").empty();
    var calendar_days = $(".tbody");
    var month = date.getMonth();
    var year = date.getFullYear();
    var day = date.getDate();
    var day_count = days_in_month(month, year);
    var row = $("<tr class='table-row'></tr>");
    var today = new Date();

    // Set date to 1 to find the first day of the month
    date.setDate(1);
    var first_day = date.getDay();
    // 35+firstDay is the number of date elements to be added to the dates table
    // 35 is from (7 days in a week) * (up to 5 rows of dates in a month)
    for(var i=0; i<35+first_day; i++) {
        // Since some of the elements will be blank, 
        // need to calculate actual date from index
        var day = i-first_day+1;
        // If it is a sunday, make a new row
        if(i%7===0) {
            calendar_days.append(row);
            row = $("<tr class='table-row'></tr>");
        }
        // if current index isn't a day in this month, make it blank
        if(i < first_day || day > day_count) {
            var curr_date = $("<td class='table-date nil'>"+"</td>");
            row.append(curr_date);
        }   
        else {
            var curr_date = $("<td class='table-date'>"+day+"</td>");
            var events = check_events(day, month+1, year);
            var isToday = today.getDate() == day && today.getMonth() == month && today.getFullYear() == year
            if(isToday && $(".active-date").length===0) {
                curr_date.addClass("active-date");
            } else if (new Date(year, month, day) < today) {
                curr_date.addClass("past-date");
            }
            
            // If this date has any events, style it with .event-date
            if(events.length!==0) {
                curr_date.addClass("event-date");
            }
            
            row.append(curr_date);
        }
    }
    
    show_events();
    
    // Append the last row and set the current year
    calendar_days.append(row);
    $(".year-month").text(months[month] + ", " + year);
}

// Get the number of days in a given month/year
function days_in_month(month, year) {
    var monthStart = new Date(year, month, 1);
    var monthEnd = new Date(year, month + 1, 1);
    return (monthEnd - monthStart) / (1000 * 60 * 60 * 24);    
}

// Event handler for when a date is clicked
function date_click(event) {
    $(".events-container").show(250);
    $("#dialog").hide(250);
    $(".active-date").removeClass("active-date");
    $(this).addClass("active-date");
};

// Event handler for when a month is clicked
function month_click(event) {
    $(".events-container").show(250);
    $("#dialog").hide(250);
    var date = event.data.date;
    $(".active-month").removeClass("active-month");
    $(this).addClass("active-month");
    var new_month = $(".month").index(this);
    date.setMonth(new_month);
    init_calendar(date);
}

// Event handler for when a month is clicked
function next_month(event) {
    $("#dialog").hide(250);
    var date = event.data.date;
    var new_month = date.getMonth() + 1;
    var year = date.getFullYear()
    
    if (new_month >= 12) {
        new_month = new_month - 12;
        year = year + 1
    }
    
    $(".year-month").text(months[new_month] + ", " + year);
    date.setMonth(new_month);
    date.setFullYear(year);
    
    $(".active-month").removeClass("active-month");
    $( ".month" ).each(function( index ) {
        if (index == new_month) {
            $(this).addClass("active-month");
        }
    });
    
    init_calendar(date);
}

// Event handler for when a month is clicked
function prev_month(event) {
    $("#dialog").hide(250);
    var date = event.data.date;
    var new_month = date.getMonth() - 1;
    var year = date.getFullYear()
    
    if (new_month < 0) {
        new_month = new_month + 12;
        year = year - 1;
    }
    
    $(".year-month").text(months[new_month] + ", " + year);
    date.setMonth(new_month);
    date.setFullYear(year);
    
    $(".active-month").removeClass("active-month");
    $( ".month" ).each(function( index ) {
        if (index == new_month) {
            $(this).addClass("active-month");
        }
    });
    
    init_calendar(date);
}


// Display all events of the selected date in card views
function show_events() {
    
    var past_events = []
    var upcoming_events = [];
    var today = new Date()
    
    for(var i=0; i<event_data["events"].length; i++) {
        var event = event_data["events"][i];
        var event_date = new Date(event["year"], event["month"] - 1, event["day"])
        if(event_date >= today) {
            upcoming_events.push(event);
        } else {
            past_events.push(event);
        }
    }
    
    // Clear the dates container
    $(".events-container").empty();
    $(".events-container").show(250);
    $(".events-container").append("<h6>Upcoming events</h6>");
    
    
    // If there are no events for this date, notify the user
    if(upcoming_events.length===0) {
        
    }

    else {
        // Go through and add each event as a card to the events container
        for(var i=0; i<upcoming_events.length; i++) {
            var date_str = upcoming_events[i]["day"] + " " + months[upcoming_events[i]["month"]-1] + ", " + upcoming_events[i]["year"];
            $(".events-container").append(create_card(upcoming_events[i]["title"], upcoming_events[i]["speaker"], date_str));
        }
    }
}

function create_card(title, subtitle, date) {
    var html = "<div class='card my-3'>";
    html += "<div class='card-body'>";
    html += "<p class='card-title'><b>" + title + "</b></p>";
    html += "<p class='card-subtitle'>" + subtitle + "</p></div>";
    html += "<div class='card-footer'><span class='date'><i class='lni-calendar mr-2'></i>" + date + "</span></div>";
    html += "</div>";
    return html
}

// Checks if a specific date has any events
function check_events(day, month, year) {
    var events = [];
    for(var i=0; i<event_data["events"].length; i++) {
        var event = event_data["events"][i];
        if(event["day"]===day &&
            event["month"]===month &&
            event["year"]===year) {
                events.push(event);
            }
    }
    return events;
}

// Given data for events in JSON format
var event_data = {
    "events": [
    {
        "title": "3D Infomax improves GNNs for Molecular Property Prediction",
        "speaker": "Hannes St&auml;rk",
        "year": 2022,
        "month": 1,
        "day": 12,
        "cancelled": false
    },
    {
        "title": "Challenges of Therapeutics Machine Learning in the Wild",
        "speaker": "Kexin Huang",
        "year": 2022,
        "month": 1,
        "day": 19,
        "cancelled": false
    },
    {
        "title": "Amortized Tree Generation for Bottom-up Synthesis Planning and Synthesizable Molecular Design",
        "speaker": "Wenhao Gao",
        "year": 2022,
        "month": 1,
        "day": 26,
        "cancelled": false
    },
    {
        "title": "Model agnostic generation of counterfactual explanations for molecules",
        "speaker": "Geemi P. Wellawatte",
        "year": 2022,
        "month": 2,
        "day": 1,
        "cancelled": false
    },
    {
        "title": "Functionally Regionalized Knowledge Transfer for Low-resource Drug Discovery",
        "speaker": "Huaxiu Yao",
        "year": 2022,
        "month": 2,
        "day": 8,
        "cancelled": false
    },
    {
        "title": "Combining Latent Space and Structured Kernels for Bayesian Optimization over Combinatorial Spaces",
        "speaker": "Aryan Deshwal",
        "year": 2022,
        "month": 2,
        "day": 15,
        "cancelled": false
    },
    {
        "title": "Flow-Based Models for Molecular GraphGeneration",
        "speaker": "Nathan C. Frey",
        "year": 2022,
        "month": 2,
        "day": 22,
        "cancelled": false
    },
    {
        "title": "AI for molecule synthesis and reaction prediction",
        "speaker": "Philippe Schwaller",
        "year": 2022,
        "month": 3,
        "day": 1,
        "cancelled": false
    },
    {
        "title": "EvoMol: a flexible and interpretable evolutionary algorithm for unbiased de novo molecular generation",
        "speaker": "Thomas Cauchy",
        "year": 2022,
        "month": 3,
        "day": 8,
        "cancelled": false
    },
    ]
};

const months = [ 
    "January", 
    "February", 
    "March", 
    "April", 
    "May", 
    "June", 
    "July", 
    "August", 
    "September", 
    "October", 
    "November", 
    "December" 
];

})(jQuery);
