import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  portfolio: any;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
   this.update()
  }

  update(){
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
      });
    }
  }

  buy(index, quantity) {

    let myData;
    if (localStorage.getItem('portfolio')) {
      myData = JSON.parse(localStorage.getItem('portfolio'));
    }

    if (myData != null) {
      for (let data in myData) {

        if (myData[data].ticker == this.portfolio[index].ticker) {
          myData[data].quantity += quantity;
          myData[data].averageCost = (this.portfolio[index].last * quantity + myData[data].totalCost) / (quantity + myData[data].quantity);
          myData[data].totalCost = this.portfolio[index].last * quantity + myData[data].totalCost
        }
      }

      localStorage.setItem('portfolio', JSON.stringify(myData));
    }
    this.update()
  }

  sell(index, quantity) {
    let myData;
    if (localStorage.getItem('portfolio')) {
      myData = JSON.parse(localStorage.getItem('portfolio'));
    }
    if (myData != null) {
      let found = false;
      for (let data in myData) {
        if (myData[data].ticker == this.portfolio[index].ticker) {
          found = true;
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
  }

}
