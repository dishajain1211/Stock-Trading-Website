import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  watchlist: any;
  empty = false;
  isLoaded = false;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.update()
    var _this = this;
    setInterval(function () {
      _this.update()
    }, 15000);
  }

  update() {
    this.empty = false;
    if (localStorage.getItem('watchlist')) {
      let watchlistL = JSON.parse(localStorage.getItem('watchlist'));
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      let list = watchlistL.map(a => a.ticker);
      this.http.get("http://localhost:3000/details?ticker=" + list.toString(), {
        headers: headers,
      }).subscribe((autoData: any) => {
        this.watchlist = autoData.solutions.companyFullDetails
        this.isLoaded = true;
        for (let o in this.watchlist) {
          this.watchlist[o].name = watchlistL[o].name
        }
        console.log(this.watchlist)
        if(this.watchlist.length != 0) this.empty = false;
      });
      if (!this.watchlist || this.watchlist.length == 0) {
        this.empty = true;
      }
    } else {
      this.isLoaded = true;
      this.empty = true;
    }
  }

  unStar(ticker) {
    let watchListL = [];
    for (let a of this.watchlist) {
      if (a.ticker != ticker) {
        watchListL.push(a)
      }
    }
    this.watchlist = watchListL;
    localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
    this.update()
  }

  gotoPage(currentTicker)
  {
    this.router.navigate(['/details',currentTicker]);
  }
}
