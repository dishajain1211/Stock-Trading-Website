import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core'
import * as Highcharts from 'highcharts';


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = null;
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
  intradayChartData = null;
  currentHour = 0;

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

  printDetails() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.http.get("http://localhost:3000/details?ticker=" + this.tickSym, {
      headers: headers,
    }).subscribe((autoData: any) => {
      console.log("Got data from detail route!");
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
      this.currentHour = Number(this.tstamp2.substr(0,2));
      console.log(this.currentHour + typeof(this.currentHour));
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
      if(this.currentHour>=9 && this.currentHour<16)
      {
        this.marketOpen = true;
      }
      else{
        this.marketOpen = false;
      }

    });
    this.intradayChartSummaryTab()
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
    }
    else {
      this.removedFromWatchlist = true;
      this.addedToWatchlist = false;
    }
  }

  intradayChartSummaryTab()
  {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.http.get("http://localhost:3000/details/intradayChartData?ticker=" + this.tickSym + "&date=" +this.tstamp1[0], {
      headers: headers,
    }).subscribe((autoData: any) =>{
      this.intradayChartData = autoData.intradayChartData;
      console.log(this.intradayChartData);
    });
  }
}