import Foundation

class AnalyticsManager {
    static let shared = AnalyticsManager()
    
    #if DEBUG
    private let serverURL = "http://localhost:5001/track"  // Local development
    #else
    private let serverURL = "https://your-render-url.com/track"  // Replace with your Render URL
    #endif
    
    private init() {}
    
    func trackEvent(type: String, data: String? = nil) {
        let parameters: [String: Any] = [
            "event_type": type,
            "event_data": data ?? "",
            "platform": "ios"
        ]
        
        guard let url = URL(string: serverURL) else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: parameters)
            
            let task = URLSession.shared.dataTask(with: request) { data, response, error in
                if let error = error {
                    print("Analytics Error: \(error)")
                    return
                }
                
                if let httpResponse = response as? HTTPURLResponse,
                   !(200...299).contains(httpResponse.statusCode) {
                    print("Analytics HTTP Error: \(httpResponse.statusCode)")
                }
            }
            task.resume()
        } catch {
            print("Analytics JSON Error: \(error)")
        }
    }
}
