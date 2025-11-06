public class LoginResponse
{
    public string Id { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
    public List<string> Roles { get; set; }
}

public class TokenResponse : LoginResponse
{
    public string Token { get; set; }
    public string RefreshToken { get; set; }
}