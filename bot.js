const {Telegraf} = require('telegraf')
require('dotenv').config()
const http = require('http')
const bot = new Telegraf(process.env.BOT_TOKEN); 

// database(temp)
bot.context.db = {
    countingForDeadInsides: 0
}
let coords = {
    lon: 0,
    lat: 0
}

// chats
const ryyax = 547015874;
const s_mia_h = 681035579;
const chatpasta = -1001517072456;

// technical functions
function sleep(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
}
function reply(ctx,text){
    ctx.reply(text,{reply_to_message_id:ctx.message.message_id})
}

// functions
let onesixteen = function (){
    setInterval(()=>{
        let date = new Date();
        if(date.getUTCHours() === 23 && date.getUTCMinutes() === 16){
            bot.telegram.sendMessage(chatpasta,'1:16');
        }
    }, 60000)
}();
let morningAnnouncement = function(){
    setInterval(()=>{
        let date = new Date();
        if(date.getUTCHours() === 21 && date.getUTCMinutes() === 15){
            bot.telegram.sendMessage(chatpasta,morningMessage(date),{parse_mode:'HTML'})            
        }
    },1000)
}();
function getCoords(city_name, country_code){
    return new Promise((resolve)=>{
        http.get(`http://api.openweathermap.org/geo/1.0/direct?q=${city_name},${country_code}&limit=1&appid=${process.env.WEATHER_API_KEY}`, res=>{
            let data = '';
            res.on('data', chunk => data+=chunk);
            res.on('end',()=>{
                try{
                    data = JSON.parse(data);
                    resolve(data[0]);
                } catch(e){
                    bot.telegram.sendMessage(ryyax, `data coords error: ${e.message}`)
                }
            })
        }).on('error', e=>{
            bot.telegram.sendMessage(ryyax, `request coords error: ${e.message}`);
        });
    })
}
function getWeather(city_name, country_code){
    return new Promise((resolve)=>{
        getCoords(city_name, country_code).then(data => {
            let request = http.get(`http://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=ua`,res=>{
                let data = '';
                res.on('data', chunk => data+=chunk);
                res.on('end',()=>{
                    try{
                        data = JSON.parse(data);
                        resolve(data);
                    }catch(e){
                        bot.telegram.sendMessage(ryyax,`data weather error: ${e.message}`)
                    }
                })
            }).on('error',e=>{
                bot.telegram.sendMessage(ryyax, `request weather error: ${e.message}`)
            });    
        })     
    })
}
function getTodayWeather(){
    getWeather('Lviv','UKR').then(data=>{
        let today = {
            temp: Math.round(data.current.temp),
            feels_like: Math.round(data.current.feels_like),
            temp_max: Math.round(data.daily[0].temp.max),
            temp_min: Math.round(data.daily[0].temp.min),
        };
        bot.telegram.sendMessage(ryyax,today)
    })
}
getTodayWeather();

// messages
let morningMessage = (date) => {
return `<b>Доброго вечора, товариство!</b>
Сьогодні <b>${Math.floor((date.getTime()-new Date('February 24, 2022 03:40:00'))/1000/60/60/24)}-й</b> день, як <span class="tg-spoiler">хуйло</span> напало на нас
Але ми тримаємось і будем триматись, <u>бо ми українці!</u>
<b><i>Слава Україні!</i></b>`
}

// bot hears
bot.hears('1000',ctx=>{
    async function fn(){
        for(let i=993;i>0;i=i-7){
            ctx.reply(i);
            await sleep(3000);
        }
        ctx.reply('DEAD INSIDE!!!!!!!')
        bot.context.db.countingForDeadInsides = 0;
    }
    if(bot.context.db.countingForDeadInsides === 0){
        fn();
        bot.context.db.countingForDeadInsides = 1;
    } else{
        reply(ctx,'я можу рахувати тільки 1 раз одночасно(аби не було спаму, так то можу і більше)')    
    }
})
bot.hears('1000-7', ctx=>reply(ctx,'видно шо ти даун'));
bot.hears(/^соля$/gi, ctx=>ctx.replyWithHTML(`<a href="tg://user?id=${s_mia_h}">Наймиліше створіннячко на планеті</a>`))
bot.hears(/сам .* даун/gi, ctx=>ctx.leaveChat());
bot.hears(/((добр).*(ранку|ранок)|(день|дня)|(вечір|вечора)|(ночі))$/gi, ctx=>reply(ctx,'ми з України!'));
bot.hears(/Слава Україні/gi, ctx=> reply(ctx,'Героям Слава!'))
bot.hears(/Слава Нації/gi, ctx=>reply(ctx,'Смерть ворогам!'))
bot.hears(/^Україна!?$/gi,ctx=>reply(ctx,'Понад усе!'))
bot.hears(/^путін$/gi,ctx=>reply(ctx,'хуйло!'))
bot.hears(/рускій ваєнний карабль/gi, ctx=>reply(ctx,'іді нахуй'))
bot.hears(/Ы/gi, ctx=>reply(ctx,'Кажи слово паляниця!'))

// bot on
// bot.on('sticker', ctx => reply(ctx, 'заєбеш'))
bot.on('voice', ctx => reply(ctx,'блять в тебе шо букви платні?'))

// bot commands

// test
bot.hears('test',ctx=>{
    ctx.reply('1')
})


bot.launch();   