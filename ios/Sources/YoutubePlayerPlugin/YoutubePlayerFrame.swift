import CoreGraphics
import Foundation

public enum YoutubePlayerFrameError: Error, Equatable {
    case invalidDimensions
    case invalidPosition
}

public struct YoutubePlayerFrame: Equatable {
    public static let minimumDimension: CGFloat = 200

    public let x: CGFloat
    public let y: CGFloat
    public let width: CGFloat
    public let height: CGFloat

    public init(x: CGFloat, y: CGFloat, width: CGFloat, height: CGFloat) throws {
        guard x.isFinite, y.isFinite else {
            throw YoutubePlayerFrameError.invalidPosition
        }
        guard width.isFinite, height.isFinite,
              width >= Self.minimumDimension,
              height >= Self.minimumDimension else {
            throw YoutubePlayerFrameError.invalidDimensions
        }
        self.x = x
        self.y = y
        self.width = width
        self.height = height
    }

    public var cgRect: CGRect {
        CGRect(x: x, y: y, width: width, height: height)
    }

    public static func from(
        playerFrame: [String: Any]?,
        playerSize: [String: Any]?,
        defaultX: CGFloat = 0,
        defaultY: CGFloat = 0
    ) throws -> YoutubePlayerFrame {
        if let playerFrame = playerFrame {
            let x = CGFloat(truncating: playerFrame["x"] as? NSNumber ?? 0)
            let y = CGFloat(truncating: playerFrame["y"] as? NSNumber ?? 0)
            let width = CGFloat(truncating: playerFrame["width"] as? NSNumber ?? minimumDimension)
            let height = CGFloat(truncating: playerFrame["height"] as? NSNumber ?? minimumDimension)
            return try YoutubePlayerFrame(x: x, y: y, width: width, height: height)
        }

        let width = CGFloat(truncating: playerSize?["width"] as? NSNumber ?? minimumDimension)
        let height = CGFloat(truncating: playerSize?["height"] as? NSNumber ?? minimumDimension)
        return try YoutubePlayerFrame(x: defaultX, y: defaultY, width: width, height: height)
    }
}

typealias JSObject = [String: Any]
