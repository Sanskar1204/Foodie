import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-4 mt-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5 className="fw-bold">About Us</h5>
            <p>
              This Website is Developed By <b>Sanskar Gawari</b>
            </p>
            <p>
              Learn More About Foodie and Our Mission to Provide Delicious Food
              Items.
            </p>
          </div>
          <div className="col-md-4">
            <h5 className="fw-bold">Follow Us</h5>
            <br />
            <ul className="list-inline social-icons">
              <li className="list-inline-item">
                <a
                  href="https://www.facebook.com/sanskar.gawari.3/"
                  target="_blank"
                  className="text-white btn btn-floating rounded-circle m-1"
                  style={{ backgroundColor: "#3b5998" }}
                  role="button"
                >
                  <i className="fab fa-facebook"></i>
                </a>
              </li>

              <li className="list-inline-item">
                <a
                  href="https://www.instagram.com/_.mr_sanskar_sg1204._/"
                  target="_blank"
                  className="text-white btn btn-floating rounded-circle m-1"
                  style={{ backgroundColor: "#ac2bac" }}
                  role="button"
                >
                  <i className="fab fa-instagram"></i>
                </a>
              </li>
              <li className="list-inline-item">
                <a
                  href="https://www.linkedin.com/in/sanskar-gawari-1a8441250/"
                  target="_blank"
                  className="text-white btn btn-floating rounded-circle m-1"
                  style={{ backgroundColor: "#0082ca" }}
                  role="button"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </li>
              <li className="list-inline-item">
                <a
                  href="https://github.com/Sanskar1204/"
                  className="text-white btn btn-floating rounded-circle m-1"
                  target="_blank"
                  style={{ backgroundColor: "#333333" }}
                  role="button"
                >
                  <i className="fab fa-github"></i>
                </a>
              </li>
              <li className="list-inline-item">
                <a
                  href="mailto:sanskargawari@gmail.com"
                  className="text-white btn btn-floating rounded-circle m-1"
                  target="_blank"
                  style={{ backgroundColor: "#dd4b39" }}
                  role="button"
                >
                  <i className="fas fa-envelope"></i>
                </a>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5 className="fw-bold">Contact Info</h5>
            <p> Pune, Maharashtra</p>
            <p>Email: info@foodie.com</p>
            <p>Phone: +91-123-456-7890</p>
          </div>
        </div>
      </div>
      <div className="container mt-3">
        <div className="row">
          <div className="col-md-6">
            <p>
              &copy; 2024 <b>Foodie</b>, Inc. All rights reserved.
            </p>
          </div>
       
        </div>
      </div>
    </footer>
  );
}
