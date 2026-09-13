namespace Backend.Models
{
    public enum UserRole
    {
        Admin = 1,
        LocalGuide = 2,
        Traveler = 3,
        TravelAgent = 4
    }

    public enum GuideStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2,
        Suspended = 3
    }

    public enum ExperienceStatus
    {
        Draft = 0,
        PendingApproval = 1,
        Approved = 2,
        Rejected = 3,
        Paused = 4
    }

    public enum SeasonType
    {
        Regular = 0,
        Peak = 1,
        OffPeak = 2
    }
}