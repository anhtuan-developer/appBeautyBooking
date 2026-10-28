/* Run once against an existing BeautyBooking database before deploying the
   backend version that validates TokenVersion in JWTs. Safe to re-run. */
IF COL_LENGTH('dbo.Users', 'TokenVersion') IS NULL
BEGIN
    ALTER TABLE dbo.Users
    ADD TokenVersion INT NOT NULL
        CONSTRAINT DF_Users_TokenVersion DEFAULT 0;
END;
GO
