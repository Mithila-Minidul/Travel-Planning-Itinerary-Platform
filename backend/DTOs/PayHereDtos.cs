using System;

namespace Backend.DTOs
{
    public class PayHerePayloadDto
    {
        public string sandbox { get; set; } = "true";
        public string merchant_id { get; set; } = "";
        public string return_url { get; set; } = "";
        public string cancel_url { get; set; } = "";
        public string notify_url { get; set; } = "";
        public string order_id { get; set; } = "";
        public string items { get; set; } = "";
        public string currency { get; set; } = "LKR";
        public string amount { get; set; } = "";
        public string hash { get; set; } = "";
        public string first_name { get; set; } = "";
        public string last_name { get; set; } = "";
        public string email { get; set; } = "";
        public string phone { get; set; } = "";
        public string address { get; set; } = "";
        public string city { get; set; } = "";
        public string country { get; set; } = "Sri Lanka";
    }
}