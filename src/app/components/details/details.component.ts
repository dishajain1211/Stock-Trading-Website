import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  companyDetails = {};
  companyFullDetails = {};

  
  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    var tickSym =  this.route.snapshot.paramMap.get('ticker');
    this.printDetails()
  }

  printDetails()
  {
    console.log("Button clicked, should display text on details page!");
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded'});
    const params = new HttpParams();
    this.http.get("http://localhost:3000/details",{
      headers: headers,
      params: params
    }).subscribe((autoData: any[]) => {
      console.log("Got data from detail route!");
      console.log(autoData);
      this.companyDetails = autoData['companyDetails'];
      this.companyFullDetails = autoData['companyFullDetails'];
    });

  }
}
