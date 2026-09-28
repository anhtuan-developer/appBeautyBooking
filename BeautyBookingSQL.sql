CREATE DATABASE BeautyBooking;
GO

USE BeautyBooking;
GO

/* Bảng người dùng*/
CREATE TABLE Users
(
    UserId INT IDENTITY(1,1) PRIMARY KEY,

    FullName NVARCHAR(100) NOT NULL,

    Email VARCHAR(255) NOT NULL,

    Phone VARCHAR(20) NULL,

    PasswordHash VARCHAR(255) NOT NULL,

    Role VARCHAR(20) NOT NULL
        CONSTRAINT CK_Users_Role
        CHECK (Role IN ('CUSTOMER', 'SALON', 'ADMIN')),

    IsActive BIT NOT NULL
        CONSTRAINT DF_Users_IsActive
        DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Users_CreatedAt
        DEFAULT SYSDATETIME()
);
GO
/*bảng tránh trùng email*/
ALTER TABLE Users
ADD CONSTRAINT UQ_Users_Email UNIQUE (Email);
GO

/*bảng salon*/
CREATE TABLE Salons
(
    SalonId INT IDENTITY(1,1) PRIMARY KEY,

    OwnerUserId INT NOT NULL,

    SalonName NVARCHAR(150) NOT NULL,

    Address NVARCHAR(255) NOT NULL,

    Phone VARCHAR(20) NULL,

    Description NVARCHAR(1000) NULL,

    ImageUrl VARCHAR(500) NULL,

    Latitude DECIMAL(10,7) NULL,

    Longitude DECIMAL(10,7) NULL,

    IsActive BIT NOT NULL
        CONSTRAINT DF_Salons_IsActive
        DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Salons_CreatedAt
        DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Salons_Owner
        FOREIGN KEY (OwnerUserId)
        REFERENCES Users(UserId)
);
GO

/* bảng dịch vụ*/
CREATE TABLE dichvu
(
    ServiceId INT IDENTITY(1,1) PRIMARY KEY,

    SalonId INT NOT NULL,

    ServiceName NVARCHAR(150) NOT NULL,

    Description NVARCHAR(1000) NULL,

    Price DECIMAL(18,2) NOT NULL,

    DurationMinutes INT NOT NULL,

    ImageUrl VARCHAR(500) NULL,

    IsActive BIT NOT NULL
        CONSTRAINT DF_Services_IsActive
        DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Services_CreatedAt
        DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Services_Salon
        FOREIGN KEY (SalonId)
        REFERENCES Salons(SalonId),

    CONSTRAINT CK_Services_Price
        CHECK (Price >= 0),

    CONSTRAINT CK_Services_Duration
        CHECK (DurationMinutes > 0)
);
GO

/*bảng nhân viên*/
CREATE TABLE Employees
(
    EmployeeId INT IDENTITY(1,1) PRIMARY KEY,

    SalonId INT NOT NULL,

    UserId INT NULL,

    FullName NVARCHAR(100) NOT NULL,

    Phone VARCHAR(20) NULL,

    AvatarUrl VARCHAR(500) NULL,

    Specialization NVARCHAR(255) NULL,

    IsActive BIT NOT NULL
        CONSTRAINT DF_Employees_IsActive
        DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Employees_CreatedAt
        DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Employees_Salon
        FOREIGN KEY (SalonId)
        REFERENCES Salons(SalonId),

    CONSTRAINT FK_Employees_User
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId)
);
GO

ALTER TABLE Users
DROP CONSTRAINT CK_Users_Role;
GO

ALTER TABLE Users
ADD CONSTRAINT CK_Users_Role
CHECK (Role IN ('CUSTOMER', 'EMPLOYEE', 'SALON', 'ADMIN'));
GO

/*Lịch làm việc của nhân viên*/
CREATE TABLE EmployeeSchedules
(
    ScheduleId INT IDENTITY(1,1) PRIMARY KEY,

    EmployeeId INT NOT NULL,

    DayOfWeek TINYINT NOT NULL,

    StartTime TIME NOT NULL,

    EndTime TIME NOT NULL,

    IsWorking BIT NOT NULL
        CONSTRAINT DF_EmployeeSchedules_IsWorking
        DEFAULT 1,

    CONSTRAINT FK_EmployeeSchedules_Employee
        FOREIGN KEY (EmployeeId)
        REFERENCES Employees(EmployeeId),

    CONSTRAINT CK_EmployeeSchedules_DayOfWeek
        CHECK (DayOfWeek BETWEEN 1 AND 7),

    CONSTRAINT CK_EmployeeSchedules_Time
        CHECK (StartTime < EndTime)
);
GO

/*bảng đặt dịch vụ*/
CREATE TABLE Bookings
(
    BookingId INT IDENTITY(1,1) PRIMARY KEY,

    UserId INT NOT NULL,

    SalonId INT NOT NULL,

    ServiceId INT NOT NULL,

    EmployeeId INT NOT NULL,

    BookingDate DATE NOT NULL,

    StartTime TIME NOT NULL,

    EndTime TIME NOT NULL,

    Status VARCHAR(20) NOT NULL
        CONSTRAINT DF_Bookings_Status
        DEFAULT 'PENDING',

    Note NVARCHAR(500) NULL,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Bookings_CreatedAt
        DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_Bookings_User
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId),

    CONSTRAINT FK_Bookings_Salon
        FOREIGN KEY (SalonId)
        REFERENCES Salons(SalonId),

    CONSTRAINT FK_Bookings_Service
        FOREIGN KEY (ServiceId)
        REFERENCES dichvu(ServiceId),

    CONSTRAINT FK_Bookings_Employee
        FOREIGN KEY (EmployeeId)
        REFERENCES Employees(EmployeeId),

    CONSTRAINT CK_Bookings_Time
        CHECK (StartTime < EndTime),

    CONSTRAINT CK_Bookings_Status
        CHECK (
            Status IN
            (
                'PENDING',
                'CONFIRMED',
                'COMPLETED',
                'CANCELLED',
                'REJECTED'
            )
        )
);
GO

/*bảng đánh giá*/
CREATE TABLE Reviews
(
    ReviewId INT IDENTITY(1,1) PRIMARY KEY,

    BookingId INT NOT NULL,

    UserId INT NOT NULL,

    SalonId INT NOT NULL,

    Rating TINYINT NOT NULL,

    Comment NVARCHAR(1000) NULL,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Reviews_CreatedAt
        DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Reviews_Booking
        FOREIGN KEY (BookingId)
        REFERENCES Bookings(BookingId),

    CONSTRAINT FK_Reviews_User
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId),

    CONSTRAINT FK_Reviews_Salon
        FOREIGN KEY (SalonId)
        REFERENCES Salons(SalonId),

    CONSTRAINT CK_Reviews_Rating
        CHECK (Rating BETWEEN 1 AND 5),

    CONSTRAINT UQ_Reviews_Booking
        UNIQUE (BookingId)
);
GO

/*bảng thông báo*/
CREATE TABLE Notifications
(
    NotificationId INT IDENTITY(1,1) PRIMARY KEY,

    UserId INT NOT NULL,

    Title NVARCHAR(200) NOT NULL,

    Message NVARCHAR(1000) NOT NULL,

    Type VARCHAR(50) NULL,

    IsRead BIT NOT NULL
        CONSTRAINT DF_Notifications_IsRead
        DEFAULT 0,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Notifications_CreatedAt
        DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Notifications_User
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId)
);
GO

SELECT
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS TableName
FROM sys.foreign_keys fk
ORDER BY TableName;


/*thêm người dùng mẫu*/
INSERT INTO Users
(
    FullName,
    Email,
    Phone,
    PasswordHash,
    Role
)
VALUES
(
    N'Nguyễn Văn An',
    'an@gmail.com',
    '0901000001',
    'DEMO_HASH_CUSTOMER',
    'CUSTOMER'
),
(
    N'Trần Thị Beauty',
    'beauty@gmail.com',
    '0901000002',
    'DEMO_HASH_SALON',
    'SALON'
),
(
    N'Nguyễn Văn Bình',
    'binh@gmail.com',
    '0901000003',
    'DEMO_HASH_EMPLOYEE',
    'EMPLOYEE'
),
(
    N'Lê Minh Cường',
    'cuong@gmail.com',
    '0901000004',
    'DEMO_HASH_EMPLOYEE',
    'EMPLOYEE'
),
(
    N'Quản trị viên',
    'admin@gmail.com',
    '0901000005',
    'DEMO_HASH_ADMIN',
    'ADMIN'
);
GO

/*thêm salons mẫu*/
INSERT INTO Salons
(
    OwnerUserId,
    SalonName,
    Address,
    Phone,
    Description,
    ImageUrl,
    Latitude,
    Longitude
)
VALUES
(
    2,
    N'Beauty Hair Studio',
    N'123 Đường Cầu Giấy, Hà Nội',
    '0902000001',
    N'Salon chuyên cắt tóc, tạo kiểu, nhuộm tóc và chăm sóc sắc đẹp.',
    'https://example.com/salon1.jpg',
    21.0368000,
    105.7909000
);
GO

SELECT *
FROM Salons;

/*tạo dịch vụ*/
INSERT INTO dichvu
(
    SalonId,
    ServiceName,
    Description,
    Price,
    DurationMinutes,
    ImageUrl
)
VALUES
(
    1,
    N'Cắt tóc nam',
    N'Cắt tóc nam và tạo kiểu cơ bản.',
    80000,
    45,
    'https://example.com/cat-toc-nam.jpg'
),
(
    1,
    N'Cắt tóc nữ',
    N'Cắt tóc nữ và tạo kiểu.',
    120000,
    60,
    'https://example.com/cat-toc-nu.jpg'
),
(
    1,
    N'Gội đầu thư giãn',
    N'Gội đầu kết hợp massage thư giãn.',
    50000,
    30,
    'https://example.com/goi-dau.jpg'
),
(
    1,
    N'Nhuộm tóc',
    N'Nhuộm tóc theo màu khách hàng lựa chọn.',
    500000,
    120,
    'https://example.com/nhuom-toc.jpg'
),
(
    1,
    N'Uốn tóc',
    N'Uốn tóc và tạo kiểu.',
    450000,
    120,
    'https://example.com/uon-toc.jpg'
);
GO

/*tạo nhiệm vụ của nhân viên*/
INSERT INTO Employees
(
    SalonId,
    UserId,
    FullName,
    Phone,
    AvatarUrl,
    Specialization
)
VALUES
(
    1,
    3,
    N'Nguyễn Văn Bình',
    '0903000001',
    'https://example.com/binh.jpg',
    N'Cắt tóc nam, tạo kiểu'
),
(
    1,
    4,
    N'Lê Minh Cường',
    '0903000002',
    'https://example.com/cuong.jpg',
    N'Cắt tóc nữ, nhuộm và uốn tóc'
);
GO


/*lịch làm việc*/
INSERT INTO EmployeeSchedules
(
    EmployeeId,
    DayOfWeek,
    StartTime,
    EndTime
)
VALUES
-- Nguyễn Văn Bình
(1, 1, '08:00', '17:00'),
(1, 2, '08:00', '17:00'),
(1, 3, '08:00', '17:00'),
(1, 4, '08:00', '17:00'),
(1, 5, '08:00', '17:00'),
(1, 6, '08:00', '17:00'),

-- Lê Minh Cường
(2, 1, '08:00', '17:00'),
(2, 2, '08:00', '17:00'),
(2, 3, '08:00', '17:00'),
(2, 4, '08:00', '17:00'),
(2, 5, '08:00', '17:00'),
(2, 6, '08:00', '17:00');
GO

/*tạo bookings mẫu*/
INSERT INTO Bookings
(
    UserId,
    SalonId,
    ServiceId,
    EmployeeId,
    BookingDate,
    StartTime,
    EndTime,
    Status,
    Note
)
VALUES
(
    1,
    1,
    1,
    1,
    '2026-09-30',
    '09:00',
    '09:45',
    'CONFIRMED',
    N'Khách muốn cắt ngắn và tạo kiểu.'
);
GO


