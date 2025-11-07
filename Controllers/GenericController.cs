using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;
using System.Net.Http.Headers;

namespace invoice_admin_web.Controllers
{
    [Route("api")]
    [ApiController]
    public class GenericController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;

        private void AttachAccessToken(HttpRequestMessage requestMessage)
        {
            if (Request.Cookies.TryGetValue("access_token", out var token) && !string.IsNullOrWhiteSpace(token))
            {
                requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
        }

        public GenericController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient();
            _baseUrl = configuration["BaseUrl"] ?? throw new ArgumentNullException("BaseUrl is not configured in appsettings.json");
        }

        // Dynamic GET method
        [HttpGet("{*path}")]
        public async Task<IActionResult> DynamicGet(string path, [FromQuery] Dictionary<string, string> queryParams)
        {
            // Build the target URL
            var queryString = string.Join("&", queryParams
                .Where(q => q.Value != null)
                .Select(q => $"{Uri.EscapeDataString(q.Key)}={Uri.EscapeDataString(q.Value!)}"));
            var targetUrl = string.IsNullOrEmpty(queryString)
                ? $"{_baseUrl}/{path}"
                : $"{_baseUrl}/{path}?{queryString}";

            try
            {
                var requestMessage = new HttpRequestMessage(HttpMethod.Get, targetUrl);
                AttachAccessToken(requestMessage);

                var response = await _httpClient.SendAsync(requestMessage);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
                }

                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error forwarding GET request: {ex.Message}");
            }
        }

        // Dynamic POST method
        [HttpPost("{*path}")]
        public async Task<IActionResult> DynamicPost(string path, [FromBody] JsonElement requestBody)
        {
            // Build the target URL
            var targetUrl = $"{_baseUrl}/{path}";

            try
            {
                var content = new StringContent(requestBody.GetRawText(), Encoding.UTF8, "application/json");
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

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
                }

                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error forwarding POST request: {ex.Message}");
            }
        }

        [HttpPut("{*path}")]
        public async Task<IActionResult> DynamicPut(string path, [FromBody] JsonElement requestBody)
        {
            var targetUrl = $"{_baseUrl}/{path}";

            try
            {
                var content = new StringContent(requestBody.GetRawText(), Encoding.UTF8, "application/json");
                var requestMessage = new HttpRequestMessage(HttpMethod.Put, targetUrl)
                {
                    Content = content
                };
                AttachAccessToken(requestMessage);

                var response = await _httpClient.SendAsync(requestMessage);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
                }

                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error forwarding PUT request: {ex.Message}");
            }
        }

        // Dynamic DELETE method
        [HttpDelete("{*path}")]
        public async Task<IActionResult> DynamicDelete(string path, [FromQuery] Dictionary<string, string> queryParams)
        {
            var queryString = string.Join("&", queryParams.Select(q =>
                $"{Uri.EscapeDataString(q.Key)}={Uri.EscapeDataString(q.Value)}"));
            var targetUrl = string.IsNullOrEmpty(queryString)
                ? $"{_baseUrl}/{path}"
                : $"{_baseUrl}/{path}?{queryString}";

            try
            {
                var requestMessage = new HttpRequestMessage(HttpMethod.Delete, targetUrl);
                AttachAccessToken(requestMessage);

                var response = await _httpClient.SendAsync(requestMessage);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    return Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json");
                }

                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error forwarding DELETE request: {ex.Message}");
            }
        }

        // generate invoice
        [HttpGet("invoice/{uuid}/generate-invoice")]
        public async Task<IActionResult> GenerateInvoice(string uuid)
        {
            var targetUrl = $"{_baseUrl}/v1/InvoiceApi/{uuid}/generate-invoice";

            try
            {
                var requestMessage = new HttpRequestMessage(HttpMethod.Get, targetUrl);
                AttachAccessToken(requestMessage);

                var response = await _httpClient.SendAsync(requestMessage);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
                }

                var fileBytes = await response.Content.ReadAsByteArrayAsync();
                var fileName = response.Content.Headers.ContentDisposition?.FileName?.Trim('"') ?? $"invoice_{uuid}.pdf";

                return File(fileBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error generating invoice: {ex.Message}");
            }
        }

    }
}
