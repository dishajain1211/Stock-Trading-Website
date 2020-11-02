import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  companyDetails: any;
  companyFullDetails: any;
  tickSym = "";
  math=Math;


  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.tickSym = this.route.snapshot.paramMap.get('ticker');
    this.printDetails()
  }

  printDetails() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.http.get("http://localhost:3000/details?ticker=" + this.tickSym, {
      headers: headers,
    }).subscribe((autoData : any) => {
      console.log("Got data from detail route!");
      console.log(autoData);
      this.companyDetails = autoData.solutions.companyDetails
      this.companyFullDetails = autoData.solutions.companyFullDetails[0];
      console.log(typeof(this.companyFullDetails[0].last))
    });

  }
}