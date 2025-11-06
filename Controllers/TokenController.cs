using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;
using System.Net.Http.Headers;
using invoice_admin_web.Models;

namespace invoice_admin_web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;

        private void AttachAccessToken(HttpRequestMessage requestMessage)
        {
            if (Request.Cookies.TryGetValue("AccessToken", out var token) && !string.IsNullOrWhiteSpace(token))
            {
                requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
        }

        public TokenController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient();
            _baseUrl = configuration["BaseUrl"] ?? throw new ArgumentNullException("BaseUrl is not configured in appsettings.json");
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest body)
        {
            var targetUrl = $"{_baseUrl}/token";

            try
            {
                var json = JsonSerializer.Serialize(body);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var requestMessage = new HttpRequestMessage(HttpMethod.Post, targetUrl)
                {
                    Content = content
                };

                AttachAccessToken(requestMessage);

                if (Request.Headers.TryGetValue("tenant", out var tenantValue))
                {
                    requestMessage.Headers.TryAddWithoutValidation("tenant", tenantValue.ToArray());
                }

                var response = await _httpClient.SendAsync(requestMessage);

                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, responseBody);
                }

                var tokenResponse = JsonSerializer.Deserialize<Response<TokenResponse>>(responseBody, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                var data = tokenResponse?.Data;
                if (data == null ||
                    string.IsNullOrWhiteSpace(data.Token) ||
                    string.IsNullOrWhiteSpace(data.RefreshToken))
                {
                    return StatusCode(500, "Login response did not contain expected tokens.");
                }

                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                };

                Response.Cookies.Append("AccessToken", data.Token, cookieOptions);
                Response.Cookies.Append("RefreshToken", data.RefreshToken, cookieOptions);

                var loginResponse = new LoginResponse
                {
                    Id = data.Id,
                    UserName = data.UserName,
                    Email = data.Email,
                    Roles = data.Roles
                };

                return Ok(new Response<LoginResponse>(loginResponse));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error forwarding refresh token request: {ex.Message}");
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            var targetUrl = $"{_baseUrl}/token/refresh";

            try
            {
                var hasAccessToken = Request.Cookies.TryGetValue("AccessToken", out var accessToken);
                var hasRefreshToken = Request.Cookies.TryGetValue("RefreshToken", out var refreshToken);

                if (!hasAccessToken || !hasRefreshToken)
                {
                    return Unauthorized("Missing authentication cookies.");
                }

                var payload = new
                {
                    token = accessToken,
                    refreshToken = refreshToken
                };

                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var requestMessage = new HttpRequestMessage(HttpMethod.Post, targetUrl)
                {
                    Content = content
                };

                AttachAccessToken(requestMessage);

                if (Request.Headers.TryGetValue("tenant", out var tenantValue))
                {
                    requestMessage.Headers.TryAddWithoutValidation("tenant", tenantValue.ToArray());
                }

                var response = await _httpClient.SendAsync(requestMessage);

                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, responseBody);
                }

                var tokenResponse = JsonSerializer.Deserialize<Response<TokenResponse>>(responseBody, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                var data = tokenResponse?.Data;
                if (data == null ||
                    string.IsNullOrWhiteSpace(data.Token) ||
                    string.IsNullOrWhiteSpace(data.RefreshToken))
                {
                    return StatusCode(500, "Login response did not contain expected tokens.");
                }

                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                };

                Response.Cookies.Append("AccessToken", data.Token, cookieOptions);
                Response.Cookies.Append("RefreshToken", data.RefreshToken, cookieOptions);

                var loginResponse = new LoginResponse
                {
                    Id = data.Id,
                    UserName = data.UserName,
                    Email = data.Email,
                    Roles = data.Roles
                };

                return Ok(new Response<LoginResponse>(loginResponse));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error forwarding refresh token request: {ex.Message}");
            }
        }
    }
}
