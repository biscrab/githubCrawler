const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

function getHTML(user){
    user = encodeURI(user);
    try {
        return axios.get(`https://github.com/users/${user}/contributions`, {            
            headers: {
                withCredentials: true,
                "Cookie": "tz=Asia%2FSeoul; logged_in=yes;"
            }
        });
    }catch(err){
        console.log(err);
    }
}

app.get('/:user/yearcount', function(req, res){
    getHTML(req.params.user)
        .then((html) => {
            const $ = cheerio.load(html.data);
            var yearcount = 0;
            $(`rect.ContributionCalendar-day`)
                .each(function(){
                    if($(this).attr("data-count"))
                        yearcount += (Number($(this).attr("data-count")))
            })
            res.json(yearcount);
        }
    )
})

app.get('/:user/daycount', function(req, res){
    getHTML(req.params.user)
        .then((html) => {
            const $ = cheerio.load(html.data);
            var daycount = 0;
            $(`rect[data-date="${moment().format('YYYY-MM-DD')}"].ContributionCalendar-day`)
                .each(function(){
                    daycount += Number($(this).attr("data-count"))
            })
            res.json(daycount);
        }
    )
})

app.get('/:user/weekcount', function(req, res){
    getHTML(user)
        .then((html) => {
            const $ = cheerio.load(html.data);
            var weekcount = 0;
            for(var i = 0; i <= moment().day(); i++){
                $(`rect[data-date="${moment(moment().format()).add(-i, "days").format("YYYY-MM-DD")}"].ContributionCalendar-day`)
                    .each(function(){
                        weekcount += Number($(this).attr("data-count"))
                })
            }
            res.json(weekcount);
        }
    )
})

app.get('/:user/weekarray', function(req, res){
    getHTML(user)
        .then((html) => {
            const $ = cheerio.load(html.data);
            var weekarray = [];
            for(var i = 0; i <= moment().day(); i++){
                $(`rect[data-date="${moment(moment().format()).add(-i, "days").format("YYYY-MM-DD")}"].ContributionCalendar-day`)
                    .each(function(){
                        weekarray.unshift(Number($(this).attr("data-count")))
                })
            }
            res.json(weekarray);
        }
    )
})

app.get('/:user/monthcount', function(req, res){
    getHTML(req.params.user)
        .then((html) => {
            const $ = cheerio.load(html.data);
            var monthcount = 0;
            var day = moment().date();
            for(var i = 0; i < day; i++){
                $(`rect[data-date="${moment(moment().format()).add(-i, "days").format("YYYY-MM-DD")}"].ContributionCalendar-day`)
                    .each(function(){
                        monthcount += Number($(this).attr("data-count"))
                })
            }
            res.json(monthcount);
        }
    )
})

app.get('/:user/montharray', function(req, res){
    getHTML(req.params.user)
        .then((html) => {
            const $ = cheerio.load(html.data);
            var montharray = [];
            var day = moment().date();
            for(var i = 0; i < day; i++){
                $(`rect[data-date="${moment(moment().format()).add(-i, "days").format("YYYY-MM-DD")}"].ContributionCalendar-day`)
                    .each(function(){
                        montharray.unshift(Number($(this).attr("data-count")))
                })
            }
            res.json(montharray);
        }
    )
})

app.get('/:user/yeararray', function(req, res){
    getHTML(req.params.user)
        .then((html) => {
            const $ = cheerio.load(html.data);
            const yeararray = [];
            $(`rect.ContributionCalendar-day`)
                .each(function(){
                    if($(this).attr("data-count"))
                        yeararray.push(Number($(this).attr("data-count")))
            })
            res.json(yeararray);
        }
    )
})

app.get('/:user', function(req, res){
    const yeararray = [];
    const montharray = [];
    const weekarray = [];
    var yearcount = 0;
    var monthcount = 0;
    var weekcount = 0;
    var daycount = 0;
    var mdate = moment().date();
    var mday = moment().day();
    getHTML(req.params.user) 
        .then((html) => {
            const $ = cheerio.load(html.data);
            $(`rect.ContributionCalendar-day`)
                .each(function(){
                    const count = $(this).attr("data-count");
                    const date = $(this).attr("data-date");
                    if(count){
                        yeararray.push(Number(count));
                        yearcount += Number(count);
                    }
                    if(mdate >= 0 && date == `${moment(moment().format()).add(-mdate, "days").format("YYYY-MM-DD")}`){
                        montharray.unshift(Number(count));
                        monthcount += Number(count);
                        mdate--;
                    }
                    if(mday >= 0 && date == `${moment(moment().format()).add(-mday, "days").format("YYYY-MM-DD")}`){
                        weekarray.unshift(Number(count));
                        weekcount += Number(count);
                        mday--; 
                    }
                    if(date == `${moment().format('YYYY-MM-DD')}`){
                        daycount += Number(count);
                    }
            })
            res.json({yeararray: yeararray, yearcount: yearcount, montharray: montharray, monthcount: monthcount, weekarray: weekarray, weekcount: weekcount, daycount: daycount});
        })
})

const server = app.listen(process.env.PORT || 5000, () => {
    const port = server.address().port;
    console.log(`Express is working on port ${port}`);
});