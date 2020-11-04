import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core'
import * as Highcharts from 'highcharts';
import more from 'highcharts/highcharts-more';
import IndicatorsCore from 'highcharts/indicators/indicators';
import HC_stock from 'highcharts/modules/stock';
import vbp from 'highcharts/indicators/volume-by-price';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
// import { BootstrapAlertService, BootstrapAlert } from 'ngx-bootstrap-alert';


more(Highcharts);
HC_stock(Highcharts);
IndicatorsCore(Highcharts);
vbp(Highcharts);


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  // Highcharts: typeof Highcharts = Highcharts;
  // chartOptions = null;
  ohlc1 = [];
  isChart1Present = false;
  isHighcharts1 = typeof Highcharts === 'object';
  Highcharts1: typeof Highcharts = Highcharts;
  chartOptions1 = null;

  isLoaded = false;
  news = {}
  companyDetails: any;
  companyFullDetails: any;
  tickSym = "";
  starred = false;
  change: any = 0;
  changePercent: any = 0;
  last: any = 0;
  prevClose: any = 0;
  tstamp1 = null;
  tstamp2 = null;
  marketOpen = false;
  midPrice = null;
  askPrice = null;
  askSize = null;
  bidPrice = null;
  bidSize = null;
  addedToWatchlist = false;
  removedFromWatchlist = false;
  quantity = 0;
  alertText = "";
  alert = false;
  selectedNews = 0;
  intradayChartData = [];
  currentHour = 0;
  currentMinute = 0;
  currentTime = null;
  currentPSTDate = null;
  currentDate = null;
  timeAlertSuccess = false;
  timeAlertRemoved = false;
  // noTicker = false;

  @ViewChild('closebutton') closebutton;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.tickSym = this.route.snapshot.paramMap.get('ticker');
    this.getNews();
    this.printDetails()
    let watchlist = JSON.parse(localStorage.getItem('watchlist'));
    let list = watchlist.map(a => a.ticker);
    if (list.includes(this.tickSym)) this.starred = true;
  }

  getNews() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.http.get("http://localhost:3000/news?ticker=" + this.tickSym, {
      headers: headers,
    }).subscribe((data: any) => {
      this.news = data.news.articles
      console.log(this.news)
    });
  }

  convertToLATime(dailyChartDate)
  {
    var new_date = new Date(dailyChartDate)
    var year = new_date.getUTCFullYear();
    var month = new_date.getUTCMonth();
    var day = new_date.getUTCDate();
    var hour = new_date.getUTCHours() - 7; // Hours // - 7 for Los Angeles Time
    var minute =  new_date.getUTCMinutes();
    var sec =  new_date.getUTCSeconds();
    var supDate = new Date(year,month,day,hour,minute,sec).toLocaleString("en-CA", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", hour12: false, minute: '2-digit', second: '2-digit', timeZone: "America/Los_Angeles" });;
    console.log(supDate)
    var LATimeInUTC = Date.UTC(year,month,day,hour,minute,sec);
    return LATimeInUTC;
  }

  printDetails() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.http.get("http://localhost:3000/details?ticker=" + this.tickSym, {
      headers: headers,
    }).subscribe((autoData: any) => {
      console.log("Got data from detail route!");
      this.isLoaded = true;
      console.log(autoData);
      this.companyDetails = autoData.solutions.companyDetails
      this.companyFullDetails = autoData.solutions.companyFullDetails[0];
      console.log(typeof (this.companyFullDetails.last));
      this.last = Number(this.companyFullDetails.last);
      this.prevClose = Number(this.companyFullDetails.prevClose);
      this.change = this.last - this.prevClose;
      this.changePercent = (this.change * 100) / this.prevClose;
      this.tstamp1 = this.companyFullDetails.timestamp.split('T');
      console.log(this.tstamp1);
      console.log(this.tstamp1[0]); //2020-11-03
      this.tstamp2 = this.tstamp1[1].substr(0, 8)
      console.log(this.tstamp2); //12:30:23
      // this.tstamp2 = "15:59:59"
      this.currentTime = this.tstamp2.split(":")
      this.currentHour = Number(this.currentTime[0]);
      this.currentMinute  = Number(this.currentTime[1]);
      console.log(this.currentHour + typeof(this.currentHour));
      console.log(this.currentMinute + typeof(this.currentMinute));
      if (this.companyFullDetails.mid != null) {
        this.midPrice = this.companyFullDetails.mid;
      }
      else {
        this.midPrice = '-'
      }
      if (this.companyFullDetails.askPrice != null) {
        this.askPrice = this.companyFullDetails.askPrice;
      }
      else {
        this.askPrice = '-'
      }
      if (this.companyFullDetails.askSize != null) {
        this.askSize = this.companyFullDetails.askSize;
      }
      else {
        this.askSize = '-'
      }
      if (this.companyFullDetails.bidPrice != null) {
        this.bidPrice = this.companyFullDetails.bidPrice;
      }
      else {
        this.bidPrice = '-'
      }
      if (this.companyFullDetails.bidSize != null) {
        this.bidSize = this.companyFullDetails.bidSize;
      }
      else {
        this.bidSize = '-'
      }

      // if((this.currentHour>=9 && this.currentMinute>=30) && this.currentHour<16)
      // {
      //   this.marketOpen = true;
      // }
      // else{
      //   this.marketOpen = false;
      // }
      // this.marketOpen = true //remove this
      this.intradayChartSummaryTab()

    });
    // if(this.companyFullDetails == null)
    // {
    //   this.noTicker = false;
    // }
    // else {
    //   this.noTicker = true;
    //   console.log("Empty!")

    // }
  }

  buy(quantity = 2) {
    console.log("clicked")
    let myData;
    if (localStorage.getItem('portfolio')) {
      console.log(localStorage.getItem('portfolio'))
      myData = JSON.parse(localStorage.getItem('portfolio'));
    }
    if (myData == null) {
      myData = [{
        ticker: this.tickSym,
        name: this.companyDetails.name,
        quantity: quantity,
        totalCost: this.companyFullDetails.last * quantity,
        averageCost: this.companyFullDetails.last * quantity
      }]
    } else {
      let found = false;
      for (let data in myData) {
        if (myData[data].ticker == this.tickSym) {
          found = true;
          myData[data].quantity += quantity;
          myData[data].averageCost = (this.companyFullDetails.last * quantity + myData[data].price * myData[data].quantity) / (quantity + myData[data].quantity);
          myData[data].totalCost = this.companyFullDetails.last * quantity + myData[data].price * myData[data].quantity
        }
      }
      if (!found) {
        let order = {
          ticker: this.tickSym,
          quantity: quantity,
          name: this.companyDetails.name,
          totalCost: this.companyFullDetails.last * quantity,
          averageCost: this.companyFullDetails.last * quantity
        }
        myData.push(order);
      }
    }
    console.log(myData)
    localStorage.setItem('portfolio', JSON.stringify(myData));
    this.closebutton.nativeElement.click();
    this.alertText = this.tickSym + " bought Succesfully"
    this.alert = true;
  }

  star() {
    let watchlist = JSON.parse(localStorage.getItem('watchlist'));
    let obj = { ticker: this.tickSym, name: this.companyDetails.name };
    if (this.starred) {
      //This is when the item is already starred. 
      let watchListL = [];
      for (let a of watchlist) {
        if (a.ticker != obj.ticker) {
          watchListL.push(a)
        }
      }
      watchlist = watchListL;
      this.starred = false
    } else {
      if (watchlist) {
        watchlist.push(obj)
      } else {
        watchlist = [obj]
      }
      this.starred = true
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    if (this.starred == true) {
      this.addedToWatchlist = true;
      this.removedFromWatchlist = false;
  //     this.timeAlertSuccess = true;
  //     setTimeout(()=>{                           //<<<---using ()=> syntax
  //       this.timeAlertSuccess = false;
  //  }, 3000);
  setTimeout(function(){
    $('#shouldClose').remove();
  }, 5000);
    }
    else {
      this.removedFromWatchlist = true;
      this.addedToWatchlist = false;
      setTimeout(function(){
        $('#thisShouldClose').remove();
      }, 5000);
  //     this.timeAlertRemoved = true;
  //     setTimeout(()=>{                           //<<<---using ()=> syntax
  //       this.timeAlertRemoved = false;
  //  }, 3000);
    }
    

  }

  intradayChartSummaryTab()
  {
    console.log(this.tstamp1[0]);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.http.get("http://localhost:3000/details/intradayChartData?ticker=" + this.tickSym + "&date=" +this.tstamp1[0], {
      headers: headers,
    }).subscribe((autoData: any) =>{
      this.intradayChartData = autoData.intradayChartData;
      console.log(this.intradayChartData);
      console.log(this.intradayChartData.length);

this.ohlc1 = []
for(var x=0; x < this.intradayChartData.length; x++)
{
  console.log("Try 1");
  var currDate = this.intradayChartData[x]['date'];
  
  var new_currDate = new Date(currDate).toLocaleString("en-US", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", hour12: false, minute: '2-digit', second: '2-digit', timeZone: "America/Los_Angeles" });
  var e = this.convertToLATime(currDate);
  //var utcValue = Date.parse(currDate)/1000;
  this.ohlc1.push([e,this.intradayChartData[x]['close']]);
  console.log(Date.parse(new_currDate)/1000+" "+currDate+" "+new_currDate+" "+this.intradayChartData[x]['close'])
  console.log("length"+this.ohlc1.length);

}
this.isChart1Present = true;
      this.chartOptions1 = {
        
        title: {
        text: this.tickSym
        },
        colors: ['green'],
        yAxis: [{
          lineWidth: 0,
          height: '100%',
          width:'100%',
          opposite: true,
          labels: {
              align: 'right'
          },
          title: {
              text: ''
          },
      }],
      xAxis: [{
        type: "datetime",
        tickInterval: 3600*1000,
        zoomEnabled: true,
        crosshair: true,
        // zoomEnabled: true,

      }],
      color: 'green',
      rangeSelector: {
        buttons: [],
            selected: 4,
            inputEnabled: false,
            labelStyle: {display: 'none'}
        },
        time:
        {
          setUTC: true,
        },
        series: [
          {
            marker: {
              enabled: false
          },
          
            name: this.tickSym,
            type: 'line',
            data: this.ohlc1, //ohlc
            gapSize: 4,
            showInNavigator: true,
            tooltip: {
                valueDecimals: 2
            },
            fillColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                  [0, 'green'],
                  [1, 'green']
                ]
            },
            threshold: null
        }]
      };
    });
//     let dt = new Date();

// let kolkata = dt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
// let la = dt.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  this.currentPSTDate = new Date().toLocaleString("en-CA", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", hour12: false, minute: '2-digit', second: '2-digit', timeZone: "America/Los_Angeles" });
  this.currentDate = this.currentPSTDate.split(', ');
  var curr = this.currentDate[1].split(":")
  if(this.currentDate[0]==this.tstamp1[0])
  {
    console.log("Same Day")
    if((curr[0]>=6 && curr[1]>=30) && curr[0]<13)
    {
      this.marketOpen = true;
    }
    else{
      this.marketOpen = false;
    }
  }
  else{
    console.log("Not Same Day")
    this.marketOpen = false;
  }
console.log(this.currentPSTDate)
console.log(this.intradayChartData.length);

// console.log('Kolkata:', kolkata);
// // Kolkata: 19/3/2019, 7:36:26 pm
// console.log('Los Angeles:', la);
// // Los Angeles: 3/19/2019, 7:06:26 AM
  }
}