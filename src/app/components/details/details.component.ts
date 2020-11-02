import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  companyDetails: any;
  companyFullDetails: any;
  tickSym = "";
  starred = false;
  math=Math;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.tickSym = this.route.snapshot.paramMap.get('ticker');
    this.printDetails()
    let watchlist = JSON.parse(localStorage.getItem('watchlist'));
    if (watchlist.includes(this.tickSym)) this.starred = true;
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
      console.log(typeof(this.companyFullDetails[0].last))
    });
  }

  buy(quantity = 2) {
    let myData;
    if (localStorage.getItem('portfolio')) {
      myData = JSON.parse(localStorage.getItem('portfolio'));
    }
    if (myData == null) {
      let myData = [{
        ticker: this.tickSym,
        name: this.companyDetails.name,
        quantity: quantity,
        totalCost: this.companyDetails.currPrice * quantity,
        averageCost: this.companyDetails.currPrice * quantity
      }]
    } else {
      let found = false;
      for (let data in myData) {
        if (myData[data].ticker == this.tickSym) {
          found = true;
          myData[data].quantity += quantity;
          myData[data].averageCost = (this.companyDetails.currPrice * quantity + myData[data].price * myData[data].quantity) / (quantity + myData[data].quantity);
          myData[data].totalCost = this.companyDetails.currPrice * quantity + myData[data].price * myData[data].quantity
        }
      }
      if (!found) {
        let order = {
          ticker: this.tickSym,
          quantity: quantity,
          name: this.companyDetails.name,
          totalCost: this.companyDetails.currPrice * quantity,
          averageCost: this.companyDetails.currPrice * quantity
        }
        myData.push(order);
      }
      localStorage.setItem('portfolio', JSON.stringify(myData));
    }
    this.router.navigate(['/portfolio']);
  }

  star() {
    let watchlist = JSON.parse(localStorage.getItem('watchlist'));
    if (this.starred){
      //This is when the item is already starred. 
      // watchlist = watchlist - [this.tickSym]
    } else {
      if (watchlist){
        watchlist.push({ticker: this.tickSym, name: this.companyDetails.name})
      } else {
        watchlist = [{ticker: this.tickSym, name: this.companyDetails.name}]
      }
      this.starred = true
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }
}