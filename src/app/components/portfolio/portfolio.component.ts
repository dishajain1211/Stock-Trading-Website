import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core'

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  portfolio: any;
  selected = 0;
  quantity = 0;
  alertText = "";
  alert = false;
  empty = false;
  marketOpen = false;
  tstamp1 = null;
  tstamp2 = null;
  currentHour = 0;



  @ViewChild('closebutton') closebutton;
  @ViewChild('closebutton2') closebutton2;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.update()
  }

  update() {
    this.empty = false;
    if (localStorage.getItem('portfolio')) {
      let portfolioL = JSON.parse(localStorage.getItem('portfolio'));
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      let list = portfolioL.map(a => a.ticker);
      this.http.get("http://localhost:3000/details?ticker=" + list.toString(), {
        headers: headers,
      }).subscribe((autoData: any) => {
        this.portfolio = autoData.solutions.companyFullDetails
        for (let o in this.portfolio) {
          this.portfolio[o].name = portfolioL[o].name
          this.portfolio[o].quantity = portfolioL[o].quantity
          this.portfolio[o].totalCost = portfolioL[o].totalCost
          this.portfolio[o].averageCost = portfolioL[o].averageCost
        }
        this.empty = false;
        this.tstamp1 = this.portfolio[0].timestamp.split('T');
        console.log(this.tstamp1);
        console.log(this.tstamp1[0]); //2020-11-03
        this.tstamp2 = this.tstamp1[1].substr(0, 8)
        console.log(this.tstamp2); //12:30:23
        this.currentHour = Number(this.tstamp2.substr(0, 2));
        this.currentHour = 16;
        console.log(this.currentHour + typeof (this.currentHour));
        if (this.currentHour >= 9 && this.currentHour < 16) {
          this.marketOpen = true;
          console.log("MarketOpen")
        }
        else {
          this.marketOpen = false;
          console.log("MarketClose")

        }
      });
      if (!this.portfolio || this.portfolio.length == 0) {
        this.empty = true
      }
    } else {
      this.empty = true
    }

  }

  buy(index, quantity) {

    let myData;
    let tickSym = "";
    if (localStorage.getItem('portfolio')) {
      myData = JSON.parse(localStorage.getItem('portfolio'));
    }

    if (myData != null) {
      for (let data in myData) {

        if (myData[data].ticker == this.portfolio[index].ticker) {
          tickSym = this.portfolio[index].ticker;
          myData[data].quantity += quantity;
          myData[data].averageCost = (this.portfolio[index].last * quantity + myData[data].totalCost) / (quantity + myData[data].quantity);
          myData[data].totalCost = this.portfolio[index].last * quantity + myData[data].totalCost
        }
      }

      localStorage.setItem('portfolio', JSON.stringify(myData));
    }
    this.update()
    this.closebutton.nativeElement.click();
    this.alertText = tickSym + " bought Succesfully"
    this.alert = true;
  }

  sell(index, quantity) {
    let myData;
    let tickSym = "";
    if (localStorage.getItem('portfolio')) {
      myData = JSON.parse(localStorage.getItem('portfolio'));
    }
    if (myData != null) {
      for (let data in myData) {
        if (myData[data].ticker == this.portfolio[index].ticker) {
          tickSym = this.portfolio[index].ticker;
          myData[data].quantity -= quantity;
          myData[data].averageCost = (myData[data].totalCost - this.portfolio[index].last * quantity) / (myData[data].quantity - quantity);
          myData[data].totalCost = myData[data].totalCost - this.portfolio[index].last * quantity
        }
      }
      myData = myData.filter(function (el) {
        return el.quantity > 0
      });
      localStorage.setItem('portfolio', JSON.stringify(myData));
    }
    this.update()
    this.closebutton2.nativeElement.click();
    this.alertText = tickSym + " sold Succesfully"
    this.alert = true;
  }

}
