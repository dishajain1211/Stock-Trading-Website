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
  change: any = 0;
  changePercent: any = 0;
  last: any = 0;
  prevClose: any = 0;
  tstamp1 = null;
  tstamp2 = null;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.tickSym = this.route.snapshot.paramMap.get('ticker');
    this.printDetails()
    let watchlist = JSON.parse(localStorage.getItem('watchlist'));
    let list = watchlist.map(a => a.ticker);
    if (list.includes(this.tickSym)) this.starred = true;
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
      console.log(typeof(this.companyFullDetails.last));
      this.last = Number(this.companyFullDetails.last);
      this.prevClose = Number(this.companyFullDetails.prevClose);
      this.change = this.last - this.prevClose;
      this.changePercent = (this.change*100)/this.prevClose;
      this.tstamp1 = this.companyFullDetails.timestamp.split('T');
      console.log(this.tstamp1);
      console.log(this.tstamp1[0]);
      this.tstamp2 = this.tstamp1[1].substr(0,8)
    });
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

    // this.router.navigate(['/portfolio']);
  }

  star() {
    let watchlist = JSON.parse(localStorage.getItem('watchlist'));
    let obj = {ticker: this.tickSym, name: this.companyDetails.name};
    if (this.starred){
      //This is when the item is already starred. 
      for( var i = 0; i < watchlist.length; i++){ if ( watchlist[i] == obj) { watchlist.splice(i, 1); i--; }}
    } else {
      if (watchlist){
        watchlist.push(obj)
      } else {
        watchlist = [obj]
      }
      this.starred = true
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }
}