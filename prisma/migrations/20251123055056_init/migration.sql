-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "foundedYear" INTEGER,
    "description" TEXT,
    "website" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SpeakerModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "seriesId" TEXT,
    "baseModelId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "country" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SpeakerModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SpeakerModel_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "SpeakerSeries" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SpeakerModel_baseModelId_fkey" FOREIGN KEY ("baseModelId") REFERENCES "SpeakerModel" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Cabinet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "speakerModelId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "versionName" TEXT,
    "enclosureType" TEXT NOT NULL,
    "internalVolumeLiters" REAL,
    "portDiameterMm" REAL,
    "portLengthMm" REAL,
    "tuningFrequencyHz" REAL,
    "heightMm" REAL NOT NULL,
    "widthMm" REAL NOT NULL,
    "depthMm" REAL NOT NULL,
    "weightKg" REAL NOT NULL,
    "baffleMaterial" TEXT,
    "cabinetMaterial" TEXT,
    "internalDamping" TEXT,
    "constructionNotes" TEXT,
    "validFrom" DATETIME,
    "validTo" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cabinet_speakerModelId_fkey" FOREIGN KEY ("speakerModelId") REFERENCES "SpeakerModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manufacturer" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "driverType" TEXT NOT NULL,
    "nominalDiameterMm" REAL NOT NULL,
    "nominalImpedanceOhm" REAL NOT NULL,
    "powerHandlingRmsWatts" REAL,
    "powerHandlingPeakWatts" REAL,
    "fsHz" REAL,
    "qts" REAL,
    "qes" REAL,
    "qms" REAL,
    "vasLiters" REAL,
    "sdCm2" REAL,
    "xmaxMm" REAL,
    "xmechMm" REAL,
    "reOhm" REAL,
    "leMh" REAL,
    "blTm" REAL,
    "mmsGrams" REAL,
    "cmsUmN" REAL,
    "rmsKgS" REAL,
    "sensitivityDb" REAL,
    "frequencyResponseLowerHz" REAL,
    "frequencyResponseUpperHz" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SpeakerDriverConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cabinetId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "position" TEXT,
    "role" TEXT NOT NULL,
    "wiredImpedanceOhm" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpeakerDriverConfiguration_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "Cabinet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpeakerDriverConfiguration_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionPeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "speakerModelId" TEXT NOT NULL,
    "periodName" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "distinguishingFeatures" TEXT,
    "serialNumberRange" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductionPeriod_speakerModelId_fkey" FOREIGN KEY ("speakerModelId") REFERENCES "SpeakerModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DriverCompatibility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalDriverId" TEXT NOT NULL,
    "replacementDriverId" TEXT NOT NULL,
    "compatibilityType" TEXT NOT NULL,
    "notes" TEXT,
    "confidenceLevel" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DriverCompatibility_originalDriverId_fkey" FOREIGN KEY ("originalDriverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DriverCompatibility_replacementDriverId_fkey" FOREIGN KEY ("replacementDriverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SpeakerSeries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "seriesName" TEXT NOT NULL,
    "description" TEXT,
    "yearsActive" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpeakerSeries_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeasurementData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverId" TEXT,
    "speakerModelId" TEXT,
    "measurementType" TEXT NOT NULL,
    "fileFormat" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "measuredBy" TEXT,
    "measurementDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeasurementData_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MeasurementData_speakerModelId_fkey" FOREIGN KEY ("speakerModelId") REFERENCES "SpeakerModel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE INDEX "SpeakerModel_brandId_idx" ON "SpeakerModel"("brandId");

-- CreateIndex
CREATE INDEX "SpeakerModel_seriesId_idx" ON "SpeakerModel"("seriesId");

-- CreateIndex
CREATE INDEX "SpeakerModel_baseModelId_idx" ON "SpeakerModel"("baseModelId");

-- CreateIndex
CREATE INDEX "Cabinet_speakerModelId_idx" ON "Cabinet"("speakerModelId");

-- CreateIndex
CREATE INDEX "Driver_manufacturer_idx" ON "Driver"("manufacturer");

-- CreateIndex
CREATE INDEX "Driver_driverType_idx" ON "Driver"("driverType");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_manufacturer_modelNumber_key" ON "Driver"("manufacturer", "modelNumber");

-- CreateIndex
CREATE INDEX "SpeakerDriverConfiguration_cabinetId_idx" ON "SpeakerDriverConfiguration"("cabinetId");

-- CreateIndex
CREATE INDEX "SpeakerDriverConfiguration_driverId_idx" ON "SpeakerDriverConfiguration"("driverId");

-- CreateIndex
CREATE INDEX "ProductionPeriod_speakerModelId_idx" ON "ProductionPeriod"("speakerModelId");

-- CreateIndex
CREATE INDEX "DriverCompatibility_originalDriverId_idx" ON "DriverCompatibility"("originalDriverId");

-- CreateIndex
CREATE INDEX "DriverCompatibility_replacementDriverId_idx" ON "DriverCompatibility"("replacementDriverId");

-- CreateIndex
CREATE INDEX "SpeakerSeries_brandId_idx" ON "SpeakerSeries"("brandId");

-- CreateIndex
CREATE INDEX "MeasurementData_driverId_idx" ON "MeasurementData"("driverId");

-- CreateIndex
CREATE INDEX "MeasurementData_speakerModelId_idx" ON "MeasurementData"("speakerModelId");
