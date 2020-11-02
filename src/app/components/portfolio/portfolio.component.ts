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
    // if (localStorage.getItem('portfolio')) {
    // let portfolioL = JSON.parse(localStorage.getItem('portfolio'));
    let portfolioL = [{ name: "Apple", ticker: "AAPL" }]
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let list = watchlistL.map(a => a.ticker);
    this.http.get("http://localhost:3000/details?ticker=" + list.toString(), {
      headers: headers,
    }).subscribe((autoData: any) => {
      this.portfolio = autoData.solutions.companyFullDetails
      for (let o in this.portfolio){
        this.portfolio[o].name = portfolioL[o].name
      }
      console.log(this.portfolio)
    });
    // }
  }

  buy(index, quantity) {
    let myData;
    if (localStorage.getItem('portfolio')) {
      myData = JSON.parse(localStorage.getItem('portfolio'));
    }
    if (myData != null) {
      let found = false;
      for (let data in myData) {
        if (myData[data].ticker == this.portfolio[index]) {
          found = true;
          myData[data].quantity += quantity;
          myData[data].averageCost = (this.portfolio[index].currPrice * quantity + myData[data].price * myData[data].quantity) / (quantity + myData[data].quantity);
          myData[data].totalCost = this.portfolio[index].currPrice * quantity + myData[data].price * myData[data].quantity
        }
      }
      localStorage.setItem('portfolio', JSON.stringify(myData));
    }
    this.router.navigate(['/portfolio']);
  }

  buy(index, quantity) {
    let myData;
    if (localStorage.getItem('portfolio')) {
      myData = JSON.parse(localStorage.getItem('portfolio'));
    }
    if (myData != null) {
      let found = false;
      for (let data in myData) {
        if (myData[data].ticker == this.portfolio[index]) {
          found = true;
          myData[data].quantity += quantity;
          myData[data].averageCost = (this.portfolio[index].currPrice * quantity + myData[data].price * myData[data].quantity) / (quantity + myData[data].quantity);
          myData[data].totalCost = this.portfolio[index].currPrice * quantity + myData[data].price * myData[data].quantity
        }
      }
      localStorage.setItem('portfolio', JSON.stringify(myData));
    }
    this.router.navigate(['/portfolio']);
  }

}
